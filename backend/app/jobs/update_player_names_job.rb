class UpdatePlayerNamesJob < ApplicationJob
  queue_as :default

  def perform
    Rails.logger.info("UpdatePlayerNamesJob started")

    # 全プレイヤーを100件ずつのバッチに分割して処理
    Player.find_in_batches(batch_size: 100) do |players_batch|
      player_ids = players_batch.map(&:id)
      Rails.logger.info("Enqueueing UpdatePlayerNamesBatchJob for #{player_ids.length} players")
      UpdatePlayerNamesBatchJob.set(priority: 100).perform_later(player_ids)
    end

    Rails.logger.info("UpdatePlayerNamesJob completed")
  end
end
