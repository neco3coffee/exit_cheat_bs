class UpdatePlayerNamesBatchJob < ApplicationJob
  queue_as :default

  def perform(player_ids)

    fetcher = PlayerFetcher.new
    players = Player.where(id: player_ids)

    players.each do |player|
      begin

        # 外部 API からプレイヤー情報を取得
        player_data = fetcher.fetch_player(player.tag)

        if player_data.nil?
          next
        end

        # バトルログも取得してランク計算のために使用
        battlelog_data = fetcher.fetch_battlelog(player.tag)

        # PlayerFetcher の save_or_update_player メソッドを使用
        # このメソッドは自動的に名前変更を検知して履歴を保存する
        fetcher.save_or_update_player(player_data, battlelog_data)


      rescue StandardError => e
      end
    end
  end
end
