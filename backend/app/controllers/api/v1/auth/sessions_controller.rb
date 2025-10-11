module Api
  module V1
    module Auth
      class SessionsController < ApplicationController
        ICON_CANDIDATES = %w[
          28000003
          28000007
          28000009
          28000004
          28000012
          28000006
          28000008
          28000011
          28000013
        ]

        # POST /api/v1/auth/login
        def login
          tag = params[:tag]

          begin
            fetcher = PlayerFetcher.new
            player_data = fetcher.fetch_player(tag)

            if player_data.nil?
              render json: { error: "Player not found" }, status: :not_found
              return
            end



            current_icon = player_data["icon"]["id"].to_s
            requested_icon = (ICON_CANDIDATES - [current_icon]).sample

            render json: {
              player: {
                tag: player_data["tag"],
                name: player_data["name"],
                club_name: player_data.dig("club", "name"),
                trophies: player_data["trophies"],
                current_icon: current_icon
              },
              requested_icon: requested_icon
            }
          rescue => e
            Rails.logger.error("Login error: #{e.message}")
            render json: { error: "Player not found or API error" }, status: :not_found
          end
        end

        # POST /api/v1/auth/verify
        def verify
          tag = params[:tag]
          requested_icon = params[:requested_icon].to_s

          success = false
          max_attempts = 6  # 90秒間 (15秒 × 6回)

          max_attempts.times do |attempt|
            begin
              fetcher = PlayerFetcher.new
              player_data = fetcher.fetch_player(tag)

              if player_data.nil?
                Rails.logger.error("Verification API error on attempt #{attempt + 1}: Player not found")
                next
              end

              current_icon = player_data["icon"]["id"].to_s

              Rails.logger.info("Verification attempt #{attempt + 1}: current_icon=#{current_icon}, requested_icon=#{requested_icon}")

              if current_icon == requested_icon
                success = true
                break
              end
            rescue => e
              Rails.logger.error("Verification API error on attempt #{attempt + 1}: #{e.message}")
            end

            # 最後の試行でない場合のみ15秒待機
            sleep 15 if attempt < max_attempts - 1
          end

          if success
            # verify成功時にAPIから最新情報を取得しDB保存・更新
            fetcher = PlayerFetcher.new
            player_data = fetcher.fetch_player(tag)
            if player_data.nil?
              render json: {
                status: "error",
                message: "Unable to retrieve player information."
              }, status: :internal_server_error
              return
            end
            normalized_tag = normalize_tag(player_data["tag"])
            player = Player.find_or_initialize_by(tag: normalized_tag)
            player.name = player_data["name"]
            player.icon_id = player_data.dig("icon", "id")
            player.club_name = player_data.dig("club", "name")
            player.trophies = player_data["trophies"] || 0
            player.save!

            # 既存のセッションを削除
            player.sessions.delete_all
            # 新しいセッションを作成
            session_token = SecureRandom.hex(32)
            player.sessions.create!(
              session_token: session_token,
              expires_at: 30.days.from_now
            )

            render json: {
              status: "success",
              player: {
                id: player.id,
                tag: player.tag,
                name: player.name,
                current_icon: player.icon_id&.to_s
              },
              session_token: session_token
            }
          else
            render json: {
              status: "error",
              message: "We couldn’t confirm your icon change. Please try again."
            }, status: :unauthorized
          end
        end

        # GET /api/v1/auth/me
        def me
          session_token = request.headers['Authorization']&.sub(/^Bearer /, '')

          if session_token.blank?
            render json: { error: "Authorization header required" }, status: :unauthorized
            return
          end

          session = Session.includes(:player).find_by(session_token: session_token)

          if session.nil? || session.expired?
            render json: { error: "Invalid or expired session" }, status: :unauthorized
            return
          end

          player = session.player
          render json: {
            player: {
              id: player.id,
              tag: player.tag,
              name: player.name,
              club_name: player.club_name,
              trophies: player.trophies,
              current_icon: player.icon_id&.to_s,
              rank: player.rank
            },
            session_expires_at: session.expires_at
          }
        end

        private

        def normalize_tag(tag)
          return tag unless tag

          normalized = tag.to_s.upcase.strip
          normalized = normalized.gsub('O', '0')
          normalized = "##{normalized}" unless normalized.start_with?('#')
          normalized
        end
      end
    end
  end
end
