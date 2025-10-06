class UpdatePlayerNamesBatchJob < ApplicationJob
  queue_as :default

  def perform(player_ids)
    Rails.logger.info("UpdatePlayerNamesBatchJob started for #{player_ids.length} players")

    fetcher = PlayerFetcher.new
    players = Player.where(id: player_ids)

    players.each do |player|
      begin
        Rails.logger.info("Checking player #{player.tag} for name updates")

        # 外部 API からプレイヤー情報を取得
        player_data = fetcher.fetch_player(player.tag)

        if player_data.nil?
          Rails.logger.warn("Could not fetch data for player #{player.tag}")
          next
        end

        # バトルログも取得してランク計算のために使用
        battlelog_data = fetcher.fetch_battlelog(player.tag)

        # PlayerFetcher の save_or_update_player メソッドを使用
        # このメソッドは自動的に名前変更を検知して履歴を保存する
        fetcher.save_or_update_player(player_data, battlelog_data)

        Rails.logger.info("Player #{player.tag} processed successfully")

      rescue StandardError => e
        Rails.logger.error("Error processing player #{player.tag}: #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
      end
    end

    Rails.logger.info("UpdatePlayerNamesBatchJob completed for #{player_ids.length} players")
  end
end
