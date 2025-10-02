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
        url = "https://api.brawlstars.com/v1/players/#{URI.encode_www_form_component(tag)}"
        Rails.logger.info("url: #{url}")
        Rails.logger.info("BRAWL_STARS_API_TOKEN1: #{ENV['BRAWL_STARS_API_TOKEN1']}")

        player_data = nil
        rank = nil
        badgeId = nil

        response = Faraday.get(url) do |req|
          req.headers['Authorization'] = "Bearer #{ENV['BRAWL_STARS_API_TOKEN1']}"
          req.headers['Accept'] = 'application/json'
          req.options.proxy = ENV['API_PROXY_URL'] if ENV['PROXY_ENABLED'] == 'true' && ENV['API_PROXY_URL'].present?
        end

        # Rails.logger.info("Response status: #{response.status}")
        # Rails.logger.info("Response body: #{response.body}")

        if response.status == 200
          player_data = JSON.parse(response.body)
          Rails.logger.info("player_data:\n #{JSON.pretty_generate(player_data)}")

          # clubデータの取得
          if player_data.dig('club', 'tag')
            club_tag = player_data.dig('club','tag')
            club_response = Faraday.get("https://api.brawlstars.com/v1/clubs/#{URI.encode_www_form_component(club_tag)}") do |req|
              req.headers['Authorization'] = "Bearer #{ENV['BRAWL_STARS_API_TOKEN1']}"
              req.headers['Accept'] = 'application/json'
              req.options.proxy = ENV['API_PROXY_URL'] if ENV['PROXY_ENABLED'] == 'true' && ENV['API_PROXY_URL'].present?
            end

            if club_response.status == 200
              club_data = JSON.parse(club_response.body)
              badgeId = club_data['badgeId']
            else
              # Rails.logger.error("Error fetching club data: #{club_response.status} - #{club_response.body}")
            end
          end

          # バトル履歴データの取得
          battle_response = Faraday.get("#{url}/battlelog") do |req|
            req.headers['Authorization'] = "Bearer #{ENV['BRAWL_STARS_API_TOKEN1']}"
            req.headers['Accept'] = 'application/json'
            req.options.proxy = ENV['API_PROXY_URL'] if ENV['PROXY_ENABLED'] == 'true' && ENV['API_PROXY_URL'].present?
          end

          if battle_response.status == 200
            battlelog_data =JSON.parse(battle_response.body)
          else
            # Rails.logger.error("Error fetching battle data: #{battle_response.status} - #{battle_response.body}")
          end

        end

        if player_data.nil?
          render json: {error: "Player data is nil"}, status: 500 and return
        end

        player = construct_response(player_data,battlelog_data,badgeId)
        render json: player

        rescue StandardError => e
          Rails.logger.error("Exception occurred: #{e.message}")
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
