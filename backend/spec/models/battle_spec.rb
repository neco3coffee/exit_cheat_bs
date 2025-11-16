require "rails_helper"

RSpec.describe Battle, type: :model do
  describe ".brawler_pick_rate_by_map" do
    let(:player) { create(:player, tag: "#PLAYERA") }
    let(:map_id) { 15000007 }

    let(:player_team_victory) do
      [
        { "tag" => "#PLAYERA", "brawler" => { "id" => 16000001 } },
        { "tag" => "#PLAYERB", "brawler" => { "id" => 16000002 } },
        { "tag" => "#PLAYERC", "brawler" => { "id" => 16000003 } }
      ]
    end

    let(:opponent_team_defeat) do
      [
        { "tag" => "#PLAYERD", "brawler" => { "id" => 16000004 } },
        { "tag" => "#PLAYERE", "brawler" => { "id" => 16000005 } },
        { "tag" => "#PLAYERF", "brawler" => { "id" => 16000006 } }
      ]
    end

    let(:player_team_defeat) do
      [
        { "tag" => "#PLAYERA", "brawler" => { "id" => 16000001 } },
        { "tag" => "#PLAYERH", "brawler" => { "id" => 16000007 } },
        { "tag" => "#PLAYERI", "brawler" => { "id" => 16000008 } }
      ]
    end

    let(:opponent_team_victory) do
      [
        { "tag" => "#PLAYERJ", "brawler" => { "id" => 16000009 } },
        { "tag" => "#PLAYERK", "brawler" => { "id" => 16000010 } },
        { "tag" => "#PLAYERL", "brawler" => { "id" => 16000011 } }
      ]
    end

    before do
      [
        { rank: 20, result: "victory", teams: [ player_team_victory, opponent_team_defeat ] },
        { rank: 21, result: "defeat", teams: [ opponent_team_victory, player_team_defeat ] },
        { rank: 10, result: "victory", teams: [ player_team_victory, opponent_team_defeat ] }
      ].each do |attributes|
        create(:battle,
               player: player,
               map_id: map_id,
               rank: attributes[:rank],
               result: attributes[:result],
               teams: attributes[:teams])
      end
    end

    it "returns pick and win rates for brawlers on the specified map" do
      stats = described_class.brawler_pick_rate_by_map(map_id: map_id)
      expect(stats).not_to be_empty

      brawler_player = stats.find { |entry| entry[:brawler_id] == 16000001 }
      brawler_teammate = stats.find { |entry| entry[:brawler_id] == 16000002 }
      brawler_opponent_loss = stats.find { |entry| entry[:brawler_id] == 16000004 }
      brawler_opponent_win = stats.find { |entry| entry[:brawler_id] == 16000009 }

      expect(brawler_player[:pick_rate]).to eq(1.0) # appears in both qualifying battles (2 picks / 2 battles)
      expect(brawler_player[:win_rate]).to eq(0.5)  # one victory, one defeat
      expect(brawler_player[:battle_count]).to eq(2)

      expect(brawler_teammate[:pick_rate]).to eq(0.5) # only in the victory battle
      expect(brawler_teammate[:win_rate]).to eq(1.0)
  expect(brawler_teammate[:battle_count]).to eq(1)

      expect(brawler_opponent_loss[:pick_rate]).to eq(0.5)
      expect(brawler_opponent_loss[:win_rate]).to eq(0.0)
  expect(brawler_opponent_loss[:battle_count]).to eq(1)

      expect(brawler_opponent_win[:pick_rate]).to eq(0.5)
      expect(brawler_opponent_win[:win_rate]).to eq(1.0)
  expect(brawler_opponent_win[:battle_count]).to eq(1)
    end
  end
end
