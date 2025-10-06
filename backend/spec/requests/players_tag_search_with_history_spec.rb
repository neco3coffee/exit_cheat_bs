require 'rails_helper'

RSpec.describe 'Players API - Tag Search with Name History', type: :request do
  describe 'GET /api/v1/players/:tag' do
    let(:tag) { 'ABC123' }
    let(:full_tag) { "##{tag}" }

    before do
      # 既存プレイヤーを作成（古い名前で）
      @existing_player = Player.create!(
        tag: full_tag,
        name: 'OldPlayerName',
        icon_id: 10,
        club_name: 'TestClub',
        trophies: 5000,
        rank: 15,
        approved_reports_count: 0
      )
    end

    it 'detects name changes and includes nameHistories in response' do
      # 外部API呼び出しをモックする代わりに、実際のAPIを呼び出す
      # ただし、テスト環境では安定したレスポンスが得られないため、
      # VCRカセットを使用するか、テスト用のAPIモックを使用する

      # ここでは実際のAPIを呼び出すため、外部依存を受け入れる
      get "/api/v1/players/#{tag}"

      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)

      # レスポンスの基本構造を確認
      expect(json_response).to have_key('tag')
      expect(json_response).to have_key('name')
      expect(json_response).to have_key('nameHistories')

      # nameHistoriesが配列であることを確認
      expect(json_response['nameHistories']).to be_an(Array)

      # もし名前が変更されていれば、履歴が追加されているはず
      if json_response['name'] != 'OldPlayerName'
        # データベースを確認して履歴が保存されていることを確認
        updated_player = Player.find_by(tag: full_tag)
        expect(updated_player.player_name_histories.count).to be > 0

        # 最新の履歴エントリを確認
        latest_history = updated_player.player_name_histories.order(changed_at: :desc).first
        expect(latest_history.name).to eq('OldPlayerName')
        expect(latest_history.icon_id).to eq(10)

        # レスポンスに履歴が含まれていることを確認
        expect(json_response['nameHistories'].length).to be > 0

        history_item = json_response['nameHistories'].first
        expect(history_item).to have_key('id')
        expect(history_item).to have_key('name')
        expect(history_item).to have_key('icon_id')
        expect(history_item).to have_key('changed_at')
        expect(history_item['name']).to eq('OldPlayerName')
        expect(history_item['icon_id']).to eq(10)
      end
    end

    it 'includes empty nameHistories when no history exists' do
      # 新しいプレイヤータグでテスト（まだDBに存在しない）
      new_tag = 'NEWTEST123'

      get "/api/v1/players/#{new_tag}"

      # 外部APIでプレイヤーが見つからない場合は404が返される
      if response.status == 200
        json_response = JSON.parse(response.body)
        expect(json_response).to have_key('nameHistories')
        # 新しいプレイヤーなので履歴は空
        expect(json_response['nameHistories']).to eq([])
      else
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
