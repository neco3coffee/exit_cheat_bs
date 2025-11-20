module Api
  module V1
    class Api::V1::SeasonsController < ApplicationController
      def current
        start_time, end_time, next_start_time = SeasonCalendar.current_period_in_utc

        render json: {
          startDateTime: start_time.iso8601,
          endDateTime: end_time.iso8601,
          nextStartDateTime: next_start_time.iso8601
        }, status: :ok
      rescue => e
        render json: { error: e.message }, status: :internal_server_error
      end
    end
  end
end
