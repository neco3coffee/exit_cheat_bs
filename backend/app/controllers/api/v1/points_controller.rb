module Api
  module V1
    class PointsController < ApplicationController
      before_action :authenticate_player!

      def undisplayed
        events = current_player.point_events
                               .undisplayed
                               .order(created_at: :asc)
                               .limit(10)

        response_data = {
          total_points: current_player.total_points,
          point_histories: events.map do |event|
            {
              id: event.id,
              point_type: event.reason,
              points: event.point,
              created_at: event.created_at
            }
          end
        }

        render json: response_data
      end

      def mark_displayed
        event = current_player.point_events.find(params[:id])
        event.update!(displayed: true, displayed_at: Time.current)
        head :no_content
      rescue ActiveRecord::RecordNotFound
        head :not_found
      end

      private

      def convert_reason_to_title_key(reason)
        case reason
        when "daily_login"
          "login_bonus"
        when "first_report"
          "first_report_bonus"
        when "auto_battle"
          "auto_battle_bonus"
        when "campaign"
          "campaign_bonus"
        when "admin", "manual_adjustment"
          "admin_bonus"
        else
          "#{reason}_bonus"
        end
      end
    end
  end
end
