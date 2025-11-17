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

  describe "seasonal stat calculators" do
    let(:player) { create(:player, tag: "#PLAYER1", name: "Hero", rank: 25, icon_id: 123) }
    let!(:teammate_record) { create(:player, tag: "#ALLY1", name: "Ally DB", icon_id: 456, rank: 28) }
    let!(:enemy_record) { create(:player, tag: "#ENEMY2", name: "Enemy DB", icon_id: 789, rank: 30) }

    let(:player_entry_brawler_one_first) do
      build_member(
        tag: player.tag,
        name: player.name,
        icon_id: player.icon_id,
        brawler_id: 16_000_001,
        trophies: 750,
        gadgets: [ 23_000_001 ],
        star_powers: [ 22_000_001 ],
        gears: [ 13_000_001 ]
      )
    end

    let(:player_entry_brawler_one_second) do
      build_member(
        tag: player.tag,
        name: player.name,
        icon_id: player.icon_id,
        brawler_id: 16_000_001,
        trophies: 755,
        gadgets: [ 23_000_002 ],
        star_powers: [ 22_000_001 ],
        gears: [ 13_000_002 ]
      )
    end

    let(:player_entry_brawler_two) do
      build_member(
        tag: player.tag,
        name: player.name,
        icon_id: player.icon_id,
        brawler_id: 16_000_010,
        trophies: 760,
        gadgets: [ 23_000_010 ],
        star_powers: [ 22_000_010 ],
        gears: [ 13_000_010 ]
      )
    end

    let(:teammate_one_entry) do
      build_member(
        tag: teammate_record.tag,
        name: "Ally Sample",
        icon_id: 101,
        brawler_id: 16_000_050,
        trophies: 740
      )
    end

    let(:teammate_two_entry) do
      build_member(
        tag: "#ALLY2",
        name: "Ally Bravo",
        icon_id: 102,
        brawler_id: 16_000_060,
        trophies: 730
      )
    end

    let(:enemy_one_entry) { build_member(tag: "#ENEMY1", name: "Enemy One", icon_id: 201, brawler_id: 16_000_100, trophies: 720) }
    let(:enemy_two_entry) { build_member(tag: "#ENEMY2", name: "Enemy Two", icon_id: 202, brawler_id: 16_000_110, trophies: 710) }
    let(:enemy_three_entry) { build_member(tag: "#ENEMY3", name: "Enemy Three", icon_id: 203, brawler_id: 16_000_120, trophies: 705) }
    let(:enemy_four_entry) { build_member(tag: "#ENEMY4", name: "Enemy Four", icon_id: 204, brawler_id: 16_000_130, trophies: 700) }

    before do
      create(:battle,
             player: player,
             result: "victory",
             mode: "brawlBall",
             teams: [
               [ player_entry_brawler_one_first, teammate_one_entry ],
               [ enemy_one_entry, enemy_two_entry ]
             ])

      create(:battle,
             player: player,
             result: "defeat",
             mode: "brawlBall",
             teams: [
               [ player_entry_brawler_one_second, teammate_one_entry ],
               [ enemy_one_entry, enemy_three_entry ]
             ])

      create(:battle,
             player: player,
             result: "victory",
             mode: "gemGrab",
             teams: [
               [ player_entry_brawler_two, teammate_two_entry ],
               [ enemy_two_entry, enemy_four_entry ]
             ])
    end

    describe ".calculate_brawler_stats" do
      it "aggregates pick and win rates per brawler" do
        stats = described_class.calculate_brawler_stats(player.battles)

        expect(stats.length).to eq(2)

        brawler_one = stats.find { |entry| entry[:id] == 16_000_001 }
        brawler_two = stats.find { |entry| entry[:id] == 16_000_010 }

        expect(brawler_one[:battle_count]).to eq(2)
        expect(brawler_one[:win_rate]).to eq(0.5)
        expect(brawler_one[:pick_rate]).to eq((2.0 / 3).round(4))
        expect(brawler_one[:gadgets]).to contain_exactly(23_000_001, 23_000_002)
        expect(brawler_one[:star_powers]).to contain_exactly(22_000_001)
        expect(brawler_one[:gears]).to contain_exactly(13_000_001, 13_000_002)

        expect(brawler_two[:battle_count]).to eq(1)
        expect(brawler_two[:win_rate]).to eq(1.0)
        expect(brawler_two[:pick_rate]).to eq((1.0 / 3).round(4))
        expect(brawler_two[:gadgets]).to contain_exactly(23_000_010)
        expect(brawler_two[:star_powers]).to contain_exactly(22_000_010)
        expect(brawler_two[:gears]).to contain_exactly(13_000_010)
      end
    end

    describe ".calculate_mode_stats" do
      it "returns win rates per mode with defaults" do
        stats = described_class.calculate_mode_stats(player.battles)

        expect(stats["brawlBall"]).to eq(battle_count: 2, win_rate: 0.5)
        expect(stats["gemGrab"]).to eq(battle_count: 1, win_rate: 1.0)
        expect(stats["knockout"]).to eq(battle_count: 0, win_rate: 0.0)
      end
    end

    describe ".calculate_high_win_rate_teammates" do
      it "lists teammates sorted by win rate and uses player records when available" do
        stats = described_class.calculate_high_win_rate_teammates(player, player.battles)

        expect(stats.map { |entry| entry[:tag] }).to start_with("#ALLY2", "#ALLY1")

        ally_one = stats.find { |entry| entry[:tag] == "#ALLY1" }
        ally_two = stats.find { |entry| entry[:tag] == "#ALLY2" }

        expect(ally_one[:name]).to eq("Ally DB")
        expect(ally_one[:icon_id]).to eq(456)
        expect(ally_one[:rank]).to eq(28)
        expect(ally_one[:battle_count]).to eq(2)
        expect(ally_one[:win_rate]).to eq(0.5)

        expect(ally_two[:name]).to eq("Ally Bravo")
        expect(ally_two[:icon_id]).to eq(102)
        expect(ally_two[:rank]).to eq(730)
        expect(ally_two[:battle_count]).to eq(1)
        expect(ally_two[:win_rate]).to eq(1.0)
      end
    end

    describe ".calculate_most_defeated_enemies" do
      it "lists opponents sorted by victories and includes fallback data" do
        stats = described_class.calculate_most_defeated_enemies(player, player.battles)

        expect(stats.map { |entry| entry[:tag] }).to start_with("#ENEMY2", "#ENEMY4", "#ENEMY1")

        enemy_two = stats.find { |entry| entry[:tag] == "#ENEMY2" }
        enemy_three = stats.find { |entry| entry[:tag] == "#ENEMY3" }

        expect(enemy_two[:name]).to eq("Enemy DB")
        expect(enemy_two[:icon_id]).to eq(789)
        expect(enemy_two[:rank]).to eq(30)
        expect(enemy_two[:battle_count]).to eq(2)
        expect(enemy_two[:win_rate]).to eq(1.0)

        expect(enemy_three[:name]).to eq("Enemy Three")
        expect(enemy_three[:icon_id]).to eq(203)
        expect(enemy_three[:rank]).to eq(705)
        expect(enemy_three[:battle_count]).to eq(1)
        expect(enemy_three[:win_rate]).to eq(0.0)
      end
    end
  end
end

def build_member(tag:, name:, icon_id:, brawler_id:, trophies:, gadgets: [], star_powers: [], gears: [])
  {
    "tag" => tag,
    "name" => name,
    "icon" => { "id" => icon_id },
    "brawler" => {
      "id" => brawler_id,
      "trophies" => trophies
    },
    "gadgets" => Array.wrap(gadgets).map { |id| { "id" => id } },
    "starPowers" => Array.wrap(star_powers).map { |id| { "id" => id } },
    "gears" => Array.wrap(gears).map { |id| { "id" => id } }
  }
end
