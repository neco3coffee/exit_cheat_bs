class ApplicationController < ActionController::API
  include ActionController::Cookies

  before_action :check_csrf, if: -> { Rails.env.production? }

  def current_player
    @current_player ||= authenticate_by_session_token
  end

  def authenticate_player!
    render json: { error: "Unauthorized" }, status: :unauthorized unless current_player
  end

  private

  def authenticate_by_session_token
    session_token = cookies[:session_token]
    return nil if session_token.blank?

    session = Session.includes(:player).find_by(session_token: session_token)
    return nil if session.nil? || session.expired?

    session.player
  end

  def check_csrf
      return if request.method == "GET" || request.method == "HEAD" || request.method == "OPTIONS"

      allowed_origins = [ "https://safebrawl.com", "https://www.safebrawl.com" ]

      origin = request.headers["Origin"]

      # ブラウザ経由は厳密にチェック
      if origin.present?
        raise CsrfProtectionError unless allowed_origins.include?(origin)
        return
      end

      # サーバーやバッチ経由はSec-Fetch-Siteでチェック
      sec = request.headers["Sec-Fetch-Site"]

      # サーバーfetchはsecがnilの場合があるため、その場合は許可する
      return if sec.nil?

      # Originがない異常なブラウザリクエストはsame-originかsame-siteのみ許可
      allowed_sec = [ "same-origin", "same-site" ]
      raise CsrfProtectionError unless allowed_sec.include?(sec)
  end
end
