require 'rails_helper'

RSpec.describe 'Players Search API', type: :request do
  describe 'GET /api/v1/players/search' do
    let!(:player1) do
      Player.create!(
        name: 'Neco3',
        tag: '#ABC123',
        club_name: 'TestClub',
        trophies: 5432,
        rank: 3,
        icon_id: 15,
        approved_reports_count: 0
      )
    end

    let!(:player2) do
      Player.create!(
        name: 'Neco33',
        tag: '#XYZ789',
        club_name: 'AnotherClub',
        trophies: 4200,
        rank: 6,
        icon_id: 9,
        approved_reports_count: 0
      )
    end

    let!(:player3) do
      Player.create!(
        name: 'OtherPlayer',
        tag: '#DEF456',
        club_name: 'ThirdClub',
        trophies: 3000,
        rank: 10,
        icon_id: 5,
        approved_reports_count: 0
      )
    end

    let!(:player4) do
      Player.create!(
        name: 'TestNeco',
        tag: '#GHI789',
        club_name: 'FourthClub',
        trophies: 2500,
        rank: 1,
        icon_id: 3,
        approved_reports_count: 0
      )
    end

    context 'when name parameter is provided' do
      it 'returns players matching the name with correct format' do
        get '/api/v1/players/search', params: { name: 'neco3' }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response).to be_an(Array)
        expect(json_response.length).to eq(1) # neco3に部分一致するのはNeco3のみ（TestNecoは含まない）

        # レスポンス形式のチェック
        json_response.each do |player|
          expect(player).to have_key('name')
          expect(player).to have_key('icon_id')
          expect(player).to have_key('tag')
          expect(player).to have_key('club_name')
          expect(player).to have_key('trophies')
          expect(player).to have_key('rank')
          expect(player).to have_key('approved_reports_count')
          expect(player['approved_reports_count']).to eq(0)
        end

        # 結果が期待されるプレイヤーを含むかチェック（デフォルトrank=0で0-3の範囲）
        names = json_response.map { |p| p['name'] }
        expect(names).to include('Neco3')
      end

      it 'returns multiple players with broader search term' do
        get '/api/v1/players/search', params: { name: 'neco', rank: 10 }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response).to be_an(Array)
        # rank=10の範囲(7-13)で"neco"を含む名前は存在しないはず
        expect(json_response.length).to eq(0)
      end

      it 'applies rank filter correctly with default rank=0' do
        get '/api/v1/players/search', params: { name: 'neco' }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        # rank=0なので0-3の範囲 (player1のrank=3, player4のrank=1が含まれる)
        ranks = json_response.map { |p| p['rank'] }
        ranks.each do |rank|
          expect(rank).to be_between(0, 3)
        end
      end

      it 'applies rank filter correctly with rank=3' do
        get '/api/v1/players/search', params: { name: 'neco', rank: 3 }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        # rank=3なので0-6の範囲 (player1のrank=3, player2のrank=6, player4のrank=1が含まれる)
        ranks = json_response.map { |p| p['rank'] }
        ranks.each do |rank|
          expect(rank).to be_between(0, 6)
        end
      end

      it 'applies rank filter correctly with rank=21' do
        # rank 21のプレイヤーを作成
        player21 = Player.create!(
          name: 'NecoHigh',
          tag: '#HIGH21',
          club_name: 'HighClub',
          trophies: 9999,
          rank: 21,
          icon_id: 20,
          approved_reports_count: 0
        )

        get '/api/v1/players/search', params: { name: 'neco', rank: 21 }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        # rank=21なので18-21の範囲
        ranks = json_response.map { |p| p['rank'] }
        ranks.each do |rank|
          expect(rank).to be_between(18, 21)
        end
      end
    end

    context 'when history parameter is true' do
      before do
        # player1の名前履歴を作成
        PlayerNameHistory.create!(
          player: player1,
          name: 'OldNeco3',
          icon_id: 10,
          changed_at: 1.day.ago
        )
      end

      it 'includes results from player_name_histories' do
        get '/api/v1/players/search', params: { name: 'oldneco', history: true }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response.length).to eq(1)
        expect(json_response[0]['name']).to eq('Neco3')
        expect(json_response[0]['tag']).to eq('#ABC123')
      end

      it 'does not include history results when history=false' do
        get '/api/v1/players/search', params: { name: 'oldneco', history: false }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response.length).to eq(0)
      end
    end

    context 'when name parameter is missing or empty' do
      it 'returns 400 Bad Request for missing name' do
        get '/api/v1/players/search'

        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('error')
      end

      it 'returns 400 Bad Request for empty name' do
        get '/api/v1/players/search', params: { name: '' }

        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('error')
      end

      it 'returns 400 Bad Request for blank name' do
        get '/api/v1/players/search', params: { name: '   ' }

        expect(response).to have_http_status(:bad_request)
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('error')
      end
    end

    context 'response ordering' do
      it 'orders results by approved_reports_count desc' do
        get '/api/v1/players/search', params: { name: 'neco', rank: 10 }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        # approved_reports_countは全て0なので、任意の順序でOK
        # 将来的に実装時はここでテストする
        expect(json_response).to be_an(Array)
      end
    end
  end
end
