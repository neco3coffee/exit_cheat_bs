require 'rails_helper'

RSpec.describe PlayerFetcher, type: :service do
  let(:fetcher) { PlayerFetcher.new }

  describe '#trophies_to_rank_tier' do
    it 'returns 0 for negative trophies' do
      expect(fetcher.send(:trophies_to_rank_tier, -10)).to eq(0)
    end

    it 'returns 0 for nil trophies' do
      expect(fetcher.send(:trophies_to_rank_tier, nil)).to eq(0)
    end

    it 'returns correct rank tier for various trophy counts' do
      expect(fetcher.send(:trophies_to_rank_tier, 0)).to eq(0)
      expect(fetcher.send(:trophies_to_rank_tier, 50)).to eq(0)
      expect(fetcher.send(:trophies_to_rank_tier, 99)).to eq(0)
      expect(fetcher.send(:trophies_to_rank_tier, 100)).to eq(1)
      expect(fetcher.send(:trophies_to_rank_tier, 150)).to eq(1)
      expect(fetcher.send(:trophies_to_rank_tier, 200)).to eq(2)
      expect(fetcher.send(:trophies_to_rank_tier, 500)).to eq(5)
      expect(fetcher.send(:trophies_to_rank_tier, 1000)).to eq(10)
      expect(fetcher.send(:trophies_to_rank_tier, 1500)).to eq(15)
      expect(fetcher.send(:trophies_to_rank_tier, 2000)).to eq(20)
      expect(fetcher.send(:trophies_to_rank_tier, 2100)).to eq(21)
      expect(fetcher.send(:trophies_to_rank_tier, 5000)).to eq(21)
      expect(fetcher.send(:trophies_to_rank_tier, 10000)).to eq(21)
    end

    it 'returns correct rank tier at boundaries' do
      expect(fetcher.send(:trophies_to_rank_tier, 99)).to eq(0)
      expect(fetcher.send(:trophies_to_rank_tier, 100)).to eq(1)
      expect(fetcher.send(:trophies_to_rank_tier, 199)).to eq(1)
      expect(fetcher.send(:trophies_to_rank_tier, 200)).to eq(2)
      expect(fetcher.send(:trophies_to_rank_tier, 2099)).to eq(20)
      expect(fetcher.send(:trophies_to_rank_tier, 2100)).to eq(21)
    end
  end

  describe '#calculate_latest_solo_ranked_trophies' do
    let(:player_tag) { '#ABC123' }
    let(:battlelog_data) do
      {
        'items' => [
          {
            'battleTime' => '20250101T120000.000Z',
            'battle' => {
              'type' => 'soloRanked',
              'teams' => [
                [
                  {
                    'tag' => '#ABC123',
                    'brawler' => { 'trophies' => 1250 }
                  }
                ]
              ]
            }
          }
        ]
      }
    end

    it 'converts trophies to rank tier' do
      result = fetcher.send(:calculate_latest_solo_ranked_trophies, battlelog_data, player_tag)
      # 1250 trophies should map to rank tier 12
      expect(result).to eq(12)
    end

    it 'returns nil when no solo ranked battles found' do
      empty_data = { 'items' => [] }
      result = fetcher.send(:calculate_latest_solo_ranked_trophies, empty_data, player_tag)
      expect(result).to be_nil
    end

    it 'returns nil when data is nil' do
      result = fetcher.send(:calculate_latest_solo_ranked_trophies, nil, player_tag)
      expect(result).to be_nil
    end
  end
end
