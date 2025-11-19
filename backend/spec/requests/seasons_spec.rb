require 'rails_helper'

RSpec.describe "Seasons", type: :request do
  describe "GET /api/v1/seasons/current" do
    let(:zone) { ActiveSupport::TimeZone['Asia/Tokyo'] }

    it "returns current season boundaries for mid-season date" do
      travel_to zone.local(2025, 12, 25, 12).utc do
        get "/api/v1/seasons/current"

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)

        expect(json["startDateTime"]).to eq(zone.local(2025, 12, 18, 18).utc.iso8601)
        expect(json["endDateTime"]).to eq(zone.local(2026, 1, 21, 18).utc.iso8601)
      end
    end

    it "rolls over to next season after season end" do
      travel_to zone.local(2026, 1, 22, 0).utc do
        get "/api/v1/seasons/current"

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)

        expect(json["startDateTime"]).to eq(zone.local(2026, 1, 15, 18).utc.iso8601)
        expect(json["endDateTime"]).to eq(zone.local(2026, 2, 18, 18).utc.iso8601)
      end
    end
  end
end
