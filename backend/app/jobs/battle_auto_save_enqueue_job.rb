class BattleAutoSaveEnqueueJob < ApplicationJob
  queue_as :default

  BATCH_SIZE = 100

  def perform
    eligible_players.find_in_batches(batch_size: BATCH_SIZE) do |players|
      players.each do |player|
        enqueue_player_job(player)
      end
    end
  rescue StandardError => e
    Rails.logger.error("BattleAutoSaveEnqueueJob failed: #{e.message}")
    Rails.logger.error(e.backtrace.join("\n"))
    raise e
  end

  private

  def eligible_players
    # 自動記録のプレイヤー
    # Player.where(auto_save_enabled: true)
    #       .where("auto_save_expires_at IS NULL OR auto_save_expires_at > ?", Time.current)

    # 自動記録のプレイヤー + 報告されたことのあるプレイヤー
    Player
    .where(auto_save_enabled: true)
    .where("auto_save_expires_at IS NULL OR auto_save_expires_at > ?", Time.current)
    .or(
      Player.where(
        "EXISTS (
           SELECT 1
           FROM reports
           WHERE reports.reported_tag = players.tag
         )"
      )
    )
  end

  def enqueue_player_job(player)
    BattleAutoSaveJob.set(priority: 1).perform_now(player.id)
  end
end
