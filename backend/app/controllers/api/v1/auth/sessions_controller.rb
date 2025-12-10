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
            response.headers["Cache-Control"] = "no-store"
            render json: { error: "Player not found or API error" }, status: :not_found
          end
        end

        # POST /api/v1/auth/verify
        def verify
          tag = params[:tag]
          requested_icon = params[:requested_icon].to_s

          begin
            fetcher = PlayerFetcher.new
            player_data = fetcher.fetch_player(tag)

            if player_data.nil?
              response.headers["Cache-Control"] = "no-store"
              render json: {
                status: "error",
                message: "Player not found"
              }, status: :not_found
              return
            end

            current_icon = player_data["icon"]["id"].to_s

            if current_icon == requested_icon
              # verify成功時にAPIから最新情報を取得しDB保存・更新
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

              cookies[:session_token] = {
                value: session_token,
                httponly: true,
                secure: Rails.env.production?,
                same_site: Rails.env.production? ? :none : :lax,
                path: "/",
                expires: 30.days.from_now
              }

              # Grant daily login point asynchronously to avoid blocking the response
              GrantDailyLoginJob.perform_later(player.id)

              response.headers["Cache-Control"] = "no-store"
              render json: {
                status: "success",
                player: {
                  id: player.id,
                  tag: player.tag,
                  name: player.name,
                  trophies: player.trophies,
                  current_icon: player.icon_id&.to_s,
                  total_points: player.total_points
                },
                session_token: session_token
              }
            else
              # まだアイコンが変わっていない場合
              response.headers["Cache-Control"] = "no-store"
              render json: {
                status: "error",
                message: "Icon not changed yet"
              }, status: :unauthorized
            end
          rescue => e
            response.headers["Cache-Control"] = "no-store"
            render json: { status: "error", message: e.message }, status: :internal_server_error
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

          # Grant daily login point
          # TODO: 排他制御を理解してから有効化, concurrencyにplayer_tagを並べて順次処理する感じにしないとローディングが遅くなる
          # PointGrantService.new(player).grant_daily_login

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
              auto_save_expires_at: player.auto_save_expires_at,
              total_points: player.total_points
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
