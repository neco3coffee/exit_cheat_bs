module Api
  module V1
    class StatsController < ApplicationController
      # GET /api/v1/stats
      def index
        stats =
          {
            totalReportsCount: Report.count,
            totalPlayersCount: Player.count,
            totalSessionsCount: Session.active.count
          }

        render json: stats, status: :ok
      end
    end
  end
end
