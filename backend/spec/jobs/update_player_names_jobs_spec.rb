require 'rails_helper'

RSpec.describe UpdatePlayerNamesJob, type: :job do
  include ActiveSupport::Testing::TimeHelpers

  before do
    clear_enqueued_jobs
  end

  describe '#perform' do
    let!(:test_player) do
      Player.create!(
        tag: '#TESTJOB123',
        name: 'OriginalTestName',
        icon_id: 5,
        club_name: 'TestClub',
        trophies: 3000,
        rank: 10,
        approved_reports_count: 0
      )
    end

    it 'enqueues batch jobs for all players' do
      expect {
        UpdatePlayerNamesJob.perform_now
      }.to have_enqueued_job(UpdatePlayerNamesBatchJob)
    end

    it 'is scheduled to run at 9am JST daily' do
      # このテストはrecurring.ymlの設定を確認するためのもの
      # 実際のスケジューリングはSolid Queueが行う

      # 設定ファイルの内容を確認
      config_path = Rails.root.join('config', 'recurring.yml')
      expect(File.exist?(config_path)).to be true

      config = YAML.load_file(config_path)
      expect(config).to have_key('test')
      expect(config['test']).to have_key('update_player_names')
      expect(config['test']['update_player_names']['class']).to eq('UpdatePlayerNamesJob')
      expect(config['test']['update_player_names']['schedule']).to eq('at 9am every day in Asia/Tokyo')
    end
  end
end

RSpec.describe UpdatePlayerNamesBatchJob, type: :job do
  include ActiveSupport::Testing::TimeHelpers

  before do
    clear_enqueued_jobs
  end

  describe '#perform' do
    let!(:test_player) do
      Player.create!(
        tag: '#BATCHTEST123',
        name: 'BatchTestName',
        icon_id: 8,
        club_name: 'BatchTestClub',
        trophies: 4000,
        rank: 12,
        approved_reports_count: 0
      )
    end

    before do
      # テスト実行時刻を日本時間9:00に固定
      jst_9am = Time.zone.parse('2025-01-15 09:00:00 +09:00')
      travel_to(jst_9am)
    end

    after do
      travel_back
    end

    it 'processes player batch and updates names from external API' do
      # バッチジョブを実行
      expect {
        UpdatePlayerNamesBatchJob.perform_now([test_player.id])
      }.not_to raise_error

      # プレイヤーが処理されたことを確認
      # 実際のAPI呼び出しなので、成功かどうかは外部APIに依存するが、
      # 少なくともエラーなく実行されることを確認
    end

    it 'saves name history when player name changes during batch processing' do
      # PlayerFetcherをモックして名前変更をシミュレート
      allow_any_instance_of(PlayerFetcher).to receive(:fetch_player).and_return({
        'tag' => '#BATCHTEST123',
        'name' => 'UpdatedBatchTestName',  # 名前が変更された
        'icon' => { 'id' => 12 },  # アイコンも変更
        'club' => { 'name' => 'BatchTestClub' },
        'trophies' => 4500
      })

      allow_any_instance_of(PlayerFetcher).to receive(:fetch_battlelog).and_return(nil)

      expect {
        UpdatePlayerNamesBatchJob.perform_now([test_player.id])
      }.to change { PlayerNameHistory.count }.by(1)

      # 履歴が正しく保存されたか確認
      history = PlayerNameHistory.last
      expect(history.player).to eq(test_player)
      expect(history.name).to eq('BatchTestName')  # 古い名前
      expect(history.icon_id).to eq(8)  # 古いアイコン
      expect(history.changed_at).to be_within(1.second).of(Time.current)

      # プレイヤー情報が更新されたか確認
      test_player.reload
      expect(test_player.name).to eq('UpdatedBatchTestName')
      expect(test_player.icon_id).to eq(12)
    end

    it 'handles API failures gracefully' do
      # API呼び出し失敗をシミュレート
      allow_any_instance_of(PlayerFetcher).to receive(:fetch_player).and_return(nil)

      expect {
        UpdatePlayerNamesBatchJob.perform_now([test_player.id])
      }.not_to raise_error

      # プレイヤー情報は変更されないはず
      test_player.reload
      expect(test_player.name).to eq('BatchTestName')
    end

    it 'processes multiple players in a batch' do
      # 複数のプレイヤーを作成
      player2 = Player.create!(
        tag: '#BATCH2TEST123',
        name: 'BatchTest2Name',
        icon_id: 9,
        club_name: 'BatchTest2Club',
        trophies: 3500,
        rank: 11,
        approved_reports_count: 0
      )

      expect {
        UpdatePlayerNamesBatchJob.perform_now([test_player.id, player2.id])
      }.not_to raise_error
    end
  end
end
