class ApplicationController < ActionController::API
  include ActionController::Cookies

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
end
