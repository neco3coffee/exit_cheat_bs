module Api
  module V1
    class StatsController < ApplicationController
      # GET /api/v1/stats
      def index
        # Cache the stats for 1 hour to reduce database load
        stats = Rails.cache.fetch('landing_page_stats', expires_in: 1.hour) do
          {
            approvedReportsCount: Report.where(status: 'approved').count,
            totalPlayersCount: Player.count
          }
        end
        
        render json: stats, status: :ok
      end
    end
  end
end
