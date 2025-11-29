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
          28000008
          28000011
          28000013
        ]

        # 28000006 jessieのアイコンは実は２パターンあるため除外, 古参ユーザーは古いアイコンと新しいアイコンどちらを設定すればいいか悩むので除外

        # POST /api/v1/auth/login
        def login
          tag = params[:tag]

          begin
            fetcher = PlayerFetcher.new
            player_data = fetcher.fetch_player(tag)

            if player_data.nil?
              response.headers["Cache-Control"] = "no-store"
              render json: { error: "Player not found" }, status: :not_found
              return
            end



            current_icon = player_data["icon"]["id"].to_s
            requested_icon = (ICON_CANDIDATES - [ current_icon ]).sample

            response.headers["Cache-Control"] = "no-store"
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

            response.headers["Cache-Control"] = "no-store"
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
              response.headers["Cache-Control"] = "no-store"
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

            if Rails.env.production?
              cookies[:session_token] = { value: session_token, httponly: true, secure: true, expires: 30.days.from_now }
            end

            if Rails.env.development?
              cookies[:session_token] = { value: session_token, httponly: true, expires: 30.days.from_now }
            end

            response.headers["Cache-Control"] = "no-store"
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
            response.headers["Cache-Control"] = "no-store"
            render json: {
              status: "error",
              message: "We couldn’t confirm your icon change. Please try again."
            }, status: :unauthorized
          end
        end

        # GET /api/v1/auth/me
        def me
          session_token = cookies[:session_token]


          if session_token.blank?
            response.headers["Cache-Control"] = "no-store"
            render json: { error: "session token required" }, status: :unauthorized
            return
          end

          session = Session.includes(:player).find_by(session_token: session_token)

          if session.nil? || session.expired?
            response.headers["Cache-Control"] = "no-store"
            render json: { error: "Invalid or expired session" }, status: :unauthorized
            return
          end

          player = session.player

          response.headers["Cache-Control"] = "no-store"
          render json: {
            player: {
              id: player.id,
              tag: player.tag,
              name: player.name,
              club_name: player.club_name,
              trophies: player.trophies,
              current_icon: player.icon_id&.to_s,
              rank: player.rank,
              role: player.role,
              auto_save_enabled: player.auto_save_enabled,
              auto_save_expires_at: player.auto_save_expires_at
            }
          }
        end

        def logout
          if Rails.env.production?
            cookies.delete(:session_token, httponly: true, secure: true)
          else
            cookies.delete(:session_token, httponly: true)
          end
          Session.find_by(session_token: cookies[:session_token])&.destroy

          response.headers["Cache-Control"] = "no-store"
          render json: { message: "Logged out successfully" }

          rescue => e
            Rails.logger.error("Logout error: #{e.message}")

            response.headers["Cache-Control"] = "no-store"
            render json: { error: "Logout failed" }, status: :internal_server_error
        end

        private

        def normalize_tag(tag)
          return tag unless tag

          normalized = tag.to_s.upcase.strip
          normalized = normalized.gsub("O", "0")
          normalized = "##{normalized}" unless normalized.start_with?("#")
          normalized
        end
      end
    end
  end
end
