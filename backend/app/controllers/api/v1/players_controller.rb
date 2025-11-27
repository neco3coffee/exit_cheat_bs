require "faraday"
require "json"
require "uri"
require "time"

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
        Rails.logger.info("Fetched player data: #{player_data} for tag: #{tag}")
        if player_data.nil?
          render json: { error: "Player not found" }, status: 404 and return
        end

        # 2. プレイヤー情報をDBに保存または更新
        # 3. バトルログを取得
        battlelog_data = fetcher.fetch_battlelog(tag)

        # プレイヤー情報をDBに保存（バトルログも渡してランクを計算）
        player = fetcher.save_or_update_player(player_data, battlelog_data)

        # 4. クラブ情報を取得（badgeId用）
        badgeId = nil
        if player_data.dig("club", "tag")
          club_tag = player_data.dig("club", "tag")
          club_data = fetcher.fetch_club(club_tag)
          badgeId = club_data["badgeId"] if club_data
        end

        # 8. レスポンスを構築（改名履歴を含める）
        response_data = construct_response(player, player_data, badgeId)

        # 9. 改名履歴を追加
        db_player = Player.find_by(tag: tag)
        if db_player
          name_histories = db_player.player_name_histories
                                   .order(changed_at: :desc)
                                   .map do |history|
            {
              id: history.id,
              name: history.name,
              icon_id: history.icon_id,
              changed_at: history.changed_at.iso8601
            }
          end
          response_data[:nameHistories] = name_histories
          response_data[:auto_save_enabled] = db_player.auto_save_enabled
          response_data[:auto_save_expires_at] = db_player.auto_save_expires_at&.iso8601
        else
          response_data[:nameHistories] = []
        end

        response.headers["Cache-Control"] = "public, max-age=60"
        render json: response_data

      rescue StandardError => e
        Rails.logger.error("Exception occurred: #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: { error: "An error occurred while processing your request" }, status: 500
      end

      def battlelog
        tag = params[:tag].to_s.upcase.strip
        # tagの先頭に#を追加
        tag = "##{tag}" unless tag.start_with?("#")
        Rails.logger.info("tag: #{tag}")

        # PlayerFetcherを使用してプレイヤー情報を取得・保存
        fetcher = PlayerFetcher.new

        # 3. バトルログを取得
        battlelog_data = fetcher.fetch_battlelog(tag)

        # 5. 直近3件のバトルから他のプレイヤーのタグを抽出
        if battlelog_data
          recent_player_tags = fetcher.extract_player_tags_from_recent_battles(battlelog_data, 3)

          # 6. 検索対象のプレイヤー自身を除外し、まだDBに存在しないプレイヤーを非同期で保存
          recent_player_tags.each do |other_tag|
            next if other_tag == tag # 自分自身は除外

            unless Player.exists?(tag: other_tag)
              Rails.logger.info("Enqueueing SavePlayerJob for tag: #{other_tag}")
              SavePlayerJob.set(priority: 10).perform_later(other_tag)
            end
          end

          # 7. soloRankedバトルに参加したプレイヤーのランクを非同期で更新
          UpdateSoloRankedRanksJob.set(priority: 30).perform_later(battlelog_data)
        end

        response.headers["Cache-Control"] = "public, max-age=60"
        render json: battlelog_data

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
          min_rank = [ target_rank - 3, 0 ].max
          max_rank = [ target_rank + 3, 21 ].min
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
            approved_reports_count: player.approved_reports_count
          }
        end

        render json: result
      rescue StandardError => e
        Rails.logger.error("Search exception occurred: #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: { error: "An error occurred while processing your request" }, status: 500
      end


      def ranked
        tag = params[:tag].to_s.upcase.strip
        tag = "##{tag}" unless tag.start_with?("#")
        Rails.logger.info("fetching ranked data for tag: #{tag}")

        fetcher = PlayerFetcher.new
        battlelog_data = fetcher.fetch_battlelog(tag)
        if battlelog_data.nil?
          render json: { error: "Battlelog not found" }, status: 404 and return
        end

        solo_ranked_battle_logs = battlelog_data["items"].select { |item| item["battle"]["type"] == "soloRanked" }
        if solo_ranked_battle_logs.empty?
          render json: { error: "No solo ranked battles found" }, status: 404 and return
        end

        render json: {
          battle_logs: solo_ranked_battle_logs
        }

        rescue StandardError => e
          Rails.logger.error("Ranked exception occured: #{e.message}")
          Rails.logger.error(e.backtrace.join("\n"))
          render json: { error: "An error occurred while processing your request" }, status: 500 and return
      end

      def reports
        tag = params[:tag].to_s.upcase.strip
        tag = "##{tag}" unless tag.start_with?("#")
        Rails.logger.info("fetching reports for tag: #{tag}")

        reports = Report.where(reporter_tag: tag).order(created_at: :desc)
        render json: reports.as_json(only: [ :id, :reporter_tag, :reported_tag, :report_type, :status, :reason, :battle_data, :video_url, :result_url, :created_at, :updated_at ])
      end

      def toggle_battle_log_auto_save
        session_token = cookies[:session_token]

        if session_token.blank?
          render json: { error: "session token required" }, status: :unauthorized
          return
        end

        session = Session.includes(:player).find_by(session_token: session_token)

        if session.nil? || session.expired?
          render json: { error: "Invalid or expired session" }, status: :unauthorized
          return
        end

        # season終了まで有効な設定にする
        _start_time, end_time, _next_start_time = SeasonCalendar.current_period_in_utc

        player = session.player
        enabled = params[:enabled]
        # enabledがtrueの場合はexpires_atを12時間後に設定、falseの場合はnilに設定
        if enabled
          expires_at = end_time
        else
          expires_at = nil
        end

        player.update(auto_save_enabled: enabled, auto_save_expires_at: expires_at)
        render json: {
          auto_save_enabled: player.auto_save_enabled,
          auto_save_expires_at: player.auto_save_expires_at
        }
      end

      def toggle_player_auto_save
        session_token = cookies[:session_token]

        if session_token.blank?
          render json: { error: "session token required" }, status: :unauthorized
          return
        end

        session = Session.includes(:player).find_by(session_token: session_token)

        if session.nil? || session.expired?
          render json: { error: "Invalid or expired session" }, status: :unauthorized
          return
        end

        player = session.player
        tag = params[:tag].to_s.upcase.strip
        tag = tag.gsub("O", "0")
        tag = "##{tag}" unless tag.start_with?("#")
        is_admin = player.role == "admin"

        unless is_admin
          render json: { error: "Forbidden" }, status: :forbidden
          return
        end

        if tag.blank?
          render json: { error: "tag parameter is required" }, status: :bad_request
          return
        end

        target_player = Player.find_by(tag: tag)

        if target_player.nil?
          render json: { error: "Player not found" }, status: :not_found
          return
        end

        enabled = params[:enabled]

        if enabled
          expires_at = 30.days.from_now
        else
          expires_at = nil
        end

        target_player.update(auto_save_enabled: enabled, auto_save_expires_at: expires_at)
        render json: {
          auto_save_enabled: target_player.auto_save_enabled,
          auto_save_expires_at: target_player.auto_save_expires_at
        }
      end

      def stats
        tag = params[:tag].to_s.upcase.strip
        tag = tag.gsub("O", "0")
        tag = "##{tag}" unless tag.start_with?("#")
        Rails.logger.info("fetching stats for tag: #{tag}")

        player = Player.find_by(tag: tag)
        if player.nil?
          render json: { error: "Player not found" }, status: 404 and return
        end

        # ここで必要な統計情報を計算・取得
        start_time, end_time, _next_start_time = SeasonCalendar.current_period_in_utc

        battles = Battle.where(player_id: player.id)
            .where("battle_time >= ? AND battle_time < ?", start_time, end_time)
            .order(battle_time: :desc)

        win_rate = if battles.count.positive?
                     battles.where(result: "victory").count.to_f / battles.count
        else
                     0.0
        end

        highest_rank = battles.maximum(:rank) || 0

        #
        brawler_stats = Battle.calculate_brawler_stats(battles)
        mode_stats = Battle.calculate_mode_stats(battles)
        high_win_rate_teammates = Battle.calculate_high_win_rate_teammates(player, battles)
        most_defeated_enemies = Battle.calculate_most_defeated_enemies(player, battles)

        render json: {
          player: {
            tag: player.tag,
            name: player.name,
            icon_id: player.icon_id,
            rank: player.rank
          },
          season: {
            battle_count: battles.count,
            win_rate: win_rate.round(4),
            highest_rank: highest_rank
          },
          brawler_stats: brawler_stats,
          mode_stats: mode_stats,
          high_win_rate_teammates: high_win_rate_teammates,
          most_defeated_enemies: most_defeated_enemies,
          battles: battles.as_json
        }
      rescue StandardError => e
        Rails.logger.error("Stats exception occurred: #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: { error: "An error occurred while processing your request" }, status: 500
      end

      def reported_players
        tag = params[:tag].to_s.upcase.strip
        tag = tag.gsub("O", "0")
        tag = "##{tag}" unless tag.start_with?("#")
        Rails.logger.info("fetching reported players for tag: #{tag}")

        session_token = cookies[:session_token]
        session = Session.includes(:player).find_by(session_token: session_token)
        if session.nil? || session.expired?
          render json: { error: "Invalid or expired session" }, status: :unauthorized
          return
        end

        player = session.player

        if player.tag != tag
          render json: { error: "Forbidden" }, status: :forbidden
          return
        end

        reports = Report.where(reporter_tag: tag)
         .select("DISTINCT ON (reports.reported_tag) reports.reported_tag, reports.created_at")
         .order("reports.reported_tag, reports.created_at DESC")

        reported_players = reports.map do |report|
          reported_player = Player.find_by(tag: report.reported_tag)
          next unless reported_player
          name_histories = reported_player.player_name_histories
                            .order(changed_at: :desc)
                            .map do |history|
              {
                id: history.id,
                name: history.name,
                icon_id: history.icon_id,
                changed_at: history.changed_at.iso8601
              }
          end

          {
            tag: reported_player.tag,
            name: reported_player.name,
            nameHistories: name_histories,
            icon_id: reported_player.icon_id,
            rank: reported_player.rank,
            trophies: reported_player.trophies,
            approved_reports_count: reported_player.approved_reports_count,
            reportedAt: report.created_at&.iso8601,
            lastActiveAt: reported_player.last_active_at ? reported_player.last_active_at&.iso8601 : nil
          }
        end.compact

        reported_players = reported_players.sort_by do |player|
          player[:lastActiveAt] ? Time.iso8601(player[:lastActiveAt]) : Time.at(0)
        end.reverse

        Rails.logger.info("reported_players: #{reported_players}")

        render json: reported_players
      rescue StandardError => e
        Rails.logger.error("Reported players exception occurred: #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: { error: "An error occurred while processing your request" }, status: 500
      end


      def season_rankings
        start_time, end_time, _next_start_time = SeasonCalendar.current_period_in_utc

        # 現在のシーズンでrank18以上のバトルを30回以上行ったプレイヤーを対象にランキングを作成
        # rank18以上のバトルの勝率が高い順に並び替えて、上位10名を取得
        top_players = Player.joins(:battles)
                .where(battles: { battle_time: start_time...end_time })
                .where("battles.rank >= ?", 18)
                .group("players.id")
                .having("COUNT(battles.id) >= ?", 30)
                .select("players.*, SUM(CASE WHEN battles.result = 'victory' THEN 1 ELSE 0 END) AS wins_count, COUNT(battles.id) AS battles_count")
                .order(Arel.sql("SUM(CASE WHEN battles.result = 'victory' THEN 1 ELSE 0 END)::float / COUNT(battles.id) DESC"))
                .limit(10)

        # dummy top_players
        # top_players = Player.limit(10)

        rankings = top_players.map.with_index(1) do |player, index|
          battles_count = player.read_attribute(:battles_count) || 0
          wins_count = player.read_attribute(:wins_count) || 0
          win_rate = battles_count > 0 ? (wins_count.to_f / battles_count).round(3) : 0.0

          {
            ranking: index,
            tag: player.tag,
            name: player.name,
            iconId: player.icon_id,
            rank: player.rank,
            battlesCount: battles_count,
            winRate: win_rate
          }
        end

        render json: rankings
      rescue StandardError => e
        Rails.logger.error("Season rankings exception occurred: #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        render json: { error: "An error occurred while processing your request" }, status: 500
      end

      private
      # TODO: api tokenが制限に達した場合に備える

      def latest_solo_ranked_trophies(data, player_tag)
        Rails.logger.info("playerTag: #{player_tag}")
        ownTag = player_tag.tr("O", "0")
        Rails.logger.info("ownTag: #{ownTag}")

        data["items"].each do |item|
          battle = item["battle"]
          next unless battle["type"] == "soloRanked"

          battle["teams"].each do |team|
            team.each do |player|
              Rails.logger.info("Checking player tag: #{player['tag']}")
              if player["tag"] == "#{ownTag}"
                return player["brawler"]["trophies"]
              end
            end
          end
        end

        nil # 見つからなかった場合
      end

      def construct_response(player, player_data, badgeId)
        {
          tag: player_data["tag"],
          name: player_data["name"],
          nameColor: player_data["nameColor"],
          iconId: player_data.dig("icon", "id"),
          currentRank: player.rank,
          trophies: player_data["trophies"],
          highestTrophies: player_data["highestTrophies"],
          vs3Victories: player_data["3vs3Victories"],
          soloVictories: player_data["soloVictories"],
          club: {
            tag: player_data.dig("club", "tag"),
            name: player_data.dig("club", "name"),
            badgeId: badgeId
          },
          approved_reports_count: player.approved_reports_count,
          brawlers: player_data["brawlers"]
        }
      end
    end
  end
end
