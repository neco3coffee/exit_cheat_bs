module Api
  module V1
    class StatsController < ApplicationController
      # GET /api/v1/stats
      def index
        approved_reports_count = Report.where(status: 'approved').count
        total_players_count = Player.count
        
        render json: {
          approvedReportsCount: approved_reports_count,
          totalPlayersCount: total_players_count
        }, status: :ok
      end
    end
  end
end
