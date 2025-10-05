require 'rails_helper'

RSpec.describe "Players", type: :request do
  describe "GET /players/:tag" do
    it "returns a successful response" do
      get "/api/v1/players/Y2YPGCGC"
      expect(response).to have_http_status(:success)
    end
  end
end
