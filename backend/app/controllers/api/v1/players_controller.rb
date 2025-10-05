require 'faraday'
require 'json'
require 'uri'
require 'time'

module Api
  module V1
    class Api::V1::PlayersController < ApplicationController
      def show
        tag = params[:tag].to_s.upcase.strip
        # tagの先頭に#を追加
        tag = "##{tag}" unless tag.start_with?("#")
        Rails.logger.info("tag: #{tag}")

        # PlayerFetcherを使用してプレイヤー情報を取得・保存
        fetcher = PlayerFetcher.new

        # 1. 外部APIからプレイヤー情報を取得
        player_data = fetcher.fetch_player(tag)
        if player_data.nil?
          render json: {error: "Player not found"}, status: 404 and return
        end

        # 2. プレイヤー情報をDBに保存または更新
        # 3. バトルログを取得
        battlelog_data = fetcher.fetch_battlelog(tag)

        # プレイヤー情報をDBに保存（バトルログも渡してランクを計算）
        player = fetcher.save_or_update_player(player_data, battlelog_data)

        # 4. クラブ情報を取得（badgeId用）
        badgeId = nil
        if player_data.dig('club', 'tag')
          club_tag = player_data.dig('club','tag')
          club_data = fetcher.fetch_club(club_tag)
          badgeId = club_data['badgeId'] if club_data
        end

        # 5. 直近3件のバトルから他のプレイヤーのタグを抽出
        if battlelog_data
          recent_player_tags = fetcher.extract_player_tags_from_recent_battles(battlelog_data, 3)

          # 6. 検索対象のプレイヤー自身を除外し、まだDBに存在しないプレイヤーを非同期で保存
          recent_player_tags.each do |other_tag|
            next if other_tag == tag # 自分自身は除外

            unless Player.exists?(tag: other_tag)
              Rails.logger.info("Enqueueing SavePlayerJob for tag: #{other_tag}")
              SavePlayerJob.perform_later(other_tag)
            end
          end
        end

        # 7. レスポンスを構築（既存の形式を維持）
        response_data = construct_response(player_data, battlelog_data, badgeId)
        response.headers['Cache-Control'] = 'public, max-age=60'
        render json: response_data

      rescue StandardError => e
        Rails.logger.error("Exception occurred: #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: { error: "An error occurred while processing your request" }, status: 500
      end

      def search
        # nameパラメータのバリデーション
        name = params[:name].to_s.strip
        if name.blank?
          render json: { error: "Name parameter is required and cannot be empty" }, status: 400
          return
        end

        # historyパラメータ（デフォルト: false）
        include_history = ActiveModel::Type::Boolean.new.cast(params[:history])

        # rankパラメータ（デフォルト: 0）
        target_rank = params[:rank].to_i

        # rankの範囲を計算
        if target_rank == 0
          min_rank = 0
          max_rank = 3
        elsif target_rank == 21
          min_rank = 18
          max_rank = 21
        else
          min_rank = [target_rank - 3, 0].max
          max_rank = [target_rank + 3, 21].min
        end

        # 基本のプレイヤー検索クエリを構築
        base_query = Player.where("name ILIKE ?", "%#{Player.sanitize_sql_like(name)}%")
                          .where(rank: min_rank..max_rank)

        # historyが有効な場合、PlayerNameHistoryからも検索
        if include_history
          history_player_ids = PlayerNameHistory.joins(:player)
                                              .where("player_name_histories.name ILIKE ?", "%#{Player.sanitize_sql_like(name)}%")
                                              .where(players: { rank: min_rank..max_rank })
                                              .select(:player_id)
                                              .distinct
                                              .pluck(:player_id)

          # 重複を除去して結合
          player_ids = (base_query.pluck(:id) + history_player_ids).uniq
          players = Player.where(id: player_ids)
        else
          players = base_query
        end

        # approved_reports_countで降順ソート
        players = players.order(approved_reports_count: :desc)

        # レスポンス形式に変換
        result = players.map do |player|
          {
            name: player.name,
            icon_id: player.icon_id,
            tag: player.tag,
            club_name: player.club_name,
            trophies: player.trophies,
            rank: player.rank,
            approved_reports_count: 0  # MVPのため常に0
          }
        end

        render json: result
      rescue StandardError => e
        Rails.logger.error("Search exception occurred: #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: { error: "An error occurred while processing your request" }, status: 500
      end


      private
      #TODO: api tokenが制限に達した場合に備える

      def latest_solo_ranked_trophies(data, player_tag)
        Rails.logger.info("playerTag: #{player_tag}")
        ownTag = player_tag.tr("O", "0")
        Rails.logger.info("ownTag: #{ownTag}")

        data['items'].each do |item|
          battle = item['battle']
          next unless battle['type'] == 'soloRanked'

          battle['teams'].each do |team|
            team.each do |player|
              Rails.logger.info("Checking player tag: #{player['tag']}")
              if player['tag'] == "#{ownTag}"
                return player['brawler']['trophies']
              end
            end
          end
        end

        nil # 見つからなかった場合
      end

      def construct_response(player_data, battlelog_data, badgeId)
        rank = latest_solo_ranked_trophies(battlelog_data, player_data['tag']) unless battlelog_data.nil?
        Rails.logger.info("Latest solo ranked trophies: #{rank == nil ? 'nil' : rank}")
        {
          tag: player_data['tag'],
          name: player_data['name'],
          nameColor: player_data['nameColor'],
          iconId: player_data.dig('icon', 'id'),
          currentRank: rank,
          trophies: player_data['trophies'],
          highestTrophies: player_data['highestTrophies'],
          vs3Victories: player_data['3vs3Victories'],
          soloVictories: player_data['soloVictories'],
          club: {
            tag: player_data.dig('club', 'tag'),
            name: player_data.dig('club', 'name'),
            badgeId: badgeId,
          },
          battlelog: battlelog_data
        }
      end


    end
  end
end
