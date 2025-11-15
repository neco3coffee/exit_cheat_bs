require 'rails_helper'

RSpec.describe BattleAutoSaveJob, type: :job do
  let(:player) do
    create(:player,
           tag: '#PLAYER1',
           auto_save_enabled: true,
           auto_save_expires_at: 12.hours.from_now)
  end
  let(:fetcher_double) { instance_double(PlayerFetcher) }
  let(:signature) { [ '#ALLY1', '#ALLY2', '#ENEMY1', '#ENEMY2', '#ENEMY3', '#PLAYER1' ].sort.join('-') }

  let(:battlelog_data) do
    {
      'items' => [
        {
          'battleTime' => '20251115T120000.000Z',
          'event' => {
            'mode' => 'bounty',
            'map' => 'Excel'
          },
          'battle' => {
            'mode' => 'bounty',
            'type' => 'soloRanked',
            'result' => 'victory',
            'duration' => 120,
            'teams' => [
              [
                {
                  'tag' => '#PLAYER1',
                  'name' => 'TestPlayer1',
                  'brawler' => { 'trophies' => 45 }
                },
                {
                  'tag' => '#ALLY1',
                  'name' => 'Ally1',
                  'brawler' => { 'trophies' => 20 }
                },
                {
                  'tag' => '#ALLY2',
                  'name' => 'Ally2',
                  'brawler' => { 'trophies' => 22 }
                }
              ],
              [
                { 'tag' => '#ENEMY1', 'name' => 'Enemy1' },
                { 'tag' => '#ENEMY2', 'name' => 'Enemy2' },
                { 'tag' => '#ENEMY3', 'name' => 'Enemy3' }
              ]
            ]
          }
        },
        {
          'battleTime' => '20251115T121500.000Z',
          'event' => {
            'mode' => 'bounty',
            'map' => 'Excel'
          },
          'battle' => {
            'mode' => 'bounty',
            'type' => 'soloRanked',
            'result' => 'defeat',
            'duration' => 90,
            'teams' => [
              [
                {
                  'tag' => '#PLAYER1',
                  'name' => 'TestPlayer1',
                  'brawler' => { 'trophies' => 44 }
                },
                {
                  'tag' => '#ALLY1',
                  'name' => 'Ally1',
                  'brawler' => { 'trophies' => 20 }
                },
                {
                  'tag' => '#ALLY2',
                  'name' => 'Ally2',
                  'brawler' => { 'trophies' => 22 }
                }
              ],
              [
                { 'tag' => '#ENEMY1', 'name' => 'Enemy1' },
                { 'tag' => '#ENEMY2', 'name' => 'Enemy2' },
                { 'tag' => '#ENEMY3', 'name' => 'Enemy3' }
              ]
            ]
          }
        }
      ]
    }
  end

  let(:team_ranked_item) do
    {
      'battleTime' => '20251115T115000.000Z',
      'event' => {
        'mode' => 'knockout',
        'map' => 'Some Map'
      },
      'battle' => {
        'mode' => 'knockout',
        'type' => 'teamRanked',
        'result' => 'victory',
        'duration' => 100,
        'teams' => battlelog_data.dig('items', 0, 'battle', 'teams')
      }
    }
  end

  let(:mixed_battlelog_data) do
    battlelog_data.deep_dup.tap do |data|
      data['items'] << team_ranked_item
    end
  end

  let(:team_ranked_only_battlelog_data) do
    { 'items' => [ team_ranked_item ] }
  end

  let(:battlelog_data_with_new_round) do
    battlelog_data.deep_dup.tap do |data|
      data['items'] << {
        'battleTime' => '20251115T120800.000Z',
        'event' => {
          'mode' => 'bounty',
          'map' => 'Excel'
        },
        'battle' => {
          'mode' => 'bounty',
          'type' => 'soloRanked',
          'result' => 'victory',
          'duration' => 110,
          'teams' => battlelog_data.dig('items', 0, 'battle', 'teams')
        }
      }
    end
  end

  let(:battlelog_data_with_far_gap) do
    battlelog_data.deep_dup.tap do |data|
      data['items'] << {
        'battleTime' => '20251115T124000.000Z',
        'event' => {
          'mode' => 'bounty',
          'map' => 'Excel'
        },
        'battle' => {
          'mode' => 'bounty',
          'type' => 'soloRanked',
          'result' => 'defeat',
          'duration' => 105,
          'teams' => battlelog_data.dig('items', 0, 'battle', 'teams')
        }
      }
    end
  end

  before do
    allow(PlayerFetcher).to receive(:new).and_return(fetcher_double)
  end

  describe '#perform' do
    it 'creates battle records and aggregates rounds for identical teams' do
      allow(fetcher_double).to receive(:fetch_battlelog).and_return(battlelog_data)

      described_class.perform_now(player.id)

      battle = player.reload.battles.first
      expect(battle).not_to be_nil
      expect(battle.battle_id).to eq("#{signature}-2025-11-15T12:00:00Z")
      expect(battle.rank).to eq(45)
      expect(battle.mode).to eq('bounty')
      expect(battle.type).to eq('soloRanked')
      expect(battle.map).to eq('Excel')
      expect(battle.rounds.size).to eq(2)
      expect(battle.rounds.map { |round| round['battleTime'] }).to eq([
        '20251115T120000.000Z',
        '20251115T121500.000Z'
      ])
      expect(battle.result).to eq('defeat')
    end

    it 'appends new rounds without duplicating existing ones when re-run' do
      allow(fetcher_double).to receive(:fetch_battlelog).and_return(battlelog_data, battlelog_data_with_new_round)

      described_class.perform_now(player.id)
      described_class.perform_now(player.id)

      battle = player.reload.battles.first
      expect(battle.rounds.size).to eq(3)
      expect(battle.rounds.map { |round| round['battleTime'] }).to eq([
        '20251115T120000.000Z',
        '20251115T120800.000Z',
        '20251115T121500.000Z'
      ])
      expect(battle.battle_id).to eq("#{signature}-2025-11-15T12:00:00Z")
    end

    it 'creates a new battle when the time gap exceeds fifteen minutes' do
      allow(fetcher_double).to receive(:fetch_battlelog).and_return(battlelog_data_with_far_gap)

      described_class.perform_now(player.id)

      battles = player.reload.battles
      expect(battles.size).to eq(2)
      first_battle = battles.find { |b| b.rounds.size == 2 }
      second_battle = battles.find { |b| b.rounds.size == 1 }
      expect(first_battle).not_to be_nil
      expect(second_battle).not_to be_nil
      expect(first_battle.rounds.map { |round| round['battleTime'] }).to eq([
        '20251115T120000.000Z',
        '20251115T121500.000Z'
      ])
      expect(second_battle.rounds.map { |round| round['battleTime'] }).to eq([
        '20251115T124000.000Z'
      ])
      expect(first_battle.battle_id).to eq("#{signature}-2025-11-15T12:00:00Z")
      expect(second_battle.battle_id).to eq("#{signature}-2025-11-15T12:40:00Z")
    end

    it 'ignores non-soloRanked battles when mixed in the response' do
      allow(fetcher_double).to receive(:fetch_battlelog).and_return(mixed_battlelog_data)

      described_class.perform_now(player.id)

      battles = player.reload.battles
      expect(battles.size).to eq(1)
      expect(battles.first.type).to eq('soloRanked')
    end

    it 'does not create battles when only non-soloRanked items are returned' do
      allow(fetcher_double).to receive(:fetch_battlelog).and_return(team_ranked_only_battlelog_data)

      described_class.perform_now(player.id)

      expect(player.reload.battles).to be_empty
    end

    it 'skips processing when auto save is disabled or expired' do
      inactive_player = create(:player, auto_save_enabled: false, auto_save_expires_at: 1.day.from_now)
      expect(fetcher_double).not_to receive(:fetch_battlelog)

      described_class.perform_now(inactive_player.id)

      expect(inactive_player.battles.count).to eq(0)
    end
  end
end
