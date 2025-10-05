class SavePlayerJob < ApplicationJob
  queue_as :default

  def perform(player_tag)
    Rails.logger.info("SavePlayerJob started for tag: #{player_tag}")

    # 既にDBに存在するかチェック
    existing_player = Player.find_by(tag: player_tag)
    if existing_player
      Rails.logger.info("Player #{player_tag} already exists in DB, skipping...")
      return
    end

    # 外部APIからプレイヤー情報を取得して保存
    fetcher = PlayerFetcher.new
    player_data = fetcher.fetch_player(player_tag)

    if player_data
      # バトルログも取得してランク計算のために渡す
      battlelog_data = fetcher.fetch_battlelog(player_tag)
      player = fetcher.save_or_update_player(player_data, battlelog_data)
      Rails.logger.info("SavePlayerJob completed for tag: #{player_tag}, player ID: #{player.id}")
    else
      Rails.logger.error("Failed to fetch player data for tag: #{player_tag}")
    end

  rescue StandardError => e
    Rails.logger.error("SavePlayerJob failed for tag: #{player_tag}, error: #{e.message}")
    raise e
  end
end
