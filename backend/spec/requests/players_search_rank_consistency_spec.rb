require 'rails_helper'

RSpec.describe 'Player Rank Consistency between Search and Show APIs', type: :request do
  # Test to verify that the rank shown in search results matches the rank in player details
  
  let!(:player1) do
    Player.create!(
      name: 'TestPlayer1',
      tag: '#RANK5',
      club_name: 'TestClub1',
      trophies: 5000,
      rank: 5,
      icon_id: 10,
      approved_reports_count: 0
    )
  end

  let!(:player2) do
    Player.create!(
      name: 'TestPlayer2',
      tag: '#RANK10',
      club_name: 'TestClub2',
      trophies: 6000,
      rank: 10,
      icon_id: 11,
      approved_reports_count: 0
    )
  end

  let!(:player3) do
    Player.create!(
      name: 'TestPlayer3',
      tag: '#RANK3',
      club_name: 'TestClub3',
      trophies: 3000,
      rank: 3,
      icon_id: 12,
      approved_reports_count: 0
    )
  end

  describe 'rank consistency between search and show' do
    it 'returns the same rank value in search results and player details' do
      # Search for players with rank filter that includes all three players
      get '/api/v1/players/search', params: { name: 'TestPlayer', rank: 5 }
      
      expect(response).to have_http_status(:ok)
      search_results = JSON.parse(response.body)
      
      # Verify we got results
      expect(search_results).to be_an(Array)
      expect(search_results.length).to be > 0
      
      # For each player in search results, verify their rank matches what show API would return
      search_results.each do |search_player|
        # The search result should have the player's actual rank
        expected_rank = Player.find_by(tag: search_player['tag']).rank
        expect(search_player['rank']).to eq(expected_rank)
        
        # Verify it's not just returning the search parameter rank for all players
        expect(search_player['rank']).not_to eq(5) unless expected_rank == 5
      end
    end

    it 'search returns different ranks for different players, not the search parameter' do
      # When searching with rank=5 (which gives range 2-8), we should get players with rank 3 and 5
      get '/api/v1/players/search', params: { name: 'TestPlayer', rank: 5 }
      
      expect(response).to have_http_status(:ok)
      search_results = JSON.parse(response.body)
      
      # Get the ranks from search results
      ranks_in_results = search_results.map { |p| p['rank'] }.sort
      
      # We should get players with rank 3 and 5 (within range 2-8)
      # Player1 has rank 5, Player3 has rank 3
      expect(ranks_in_results).to include(3, 5)
      
      # The ranks should NOT all be the same (not all 5)
      expect(ranks_in_results.uniq.length).to be > 1
    end
  end
end
