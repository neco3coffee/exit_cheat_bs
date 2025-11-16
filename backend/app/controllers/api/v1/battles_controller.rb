

require "faraday"
require "json"
require "uri"
require "time"

module Api
  module V1
    class Api::V1::BattlesController < ApplicationController
      def map_brawler_pick_rate
        map_id = params[:id].to_i

        unless map_id.positive?
          render json: { error: "Invalid map ID" }, status: :bad_request
          return
        end

        begin
          pick_rate_data = Battle.brawler_pick_rate_by_map(
            map_id: map_id,
          )

          render json: { map_id: map_id, brawler_pick_rates: pick_rate_data }, status: :ok
        rescue => e
          render json: { error: e.message }, status: :internal_server_error
        end
      end
    end
  end
end
