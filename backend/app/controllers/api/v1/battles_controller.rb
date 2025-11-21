

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

      def maps
        # seasonの開始と終了の日付を取得
        start_time, end_time, _next_start_time = SeasonCalendar.current_period_in_utc

        # start_timeとend_timeを使って、該当するマップのデータを取得
        maps = Battle.where(created_at: start_time..end_time).where(type: "soloRanked").distinct.pluck(:map_id)

        render json: { maps: maps }, status: :ok
        # render json: { maps: ["15000082","15000703","15000703","15000703"]}
      rescue => e
        render json: { error: e.message }, status: :internal_server_error
      end
    end
  end
end
