class UpdateSoloRankedRanksJob < ApplicationJob
  queue_as :default

  def perform(battlelog_data)
    return unless battlelog_data && battlelog_data['items']

    # soloRankedバトルに参加したプレイヤーの情報を収集（重複除去）
    player_rank_updates = {}

    battlelog_data['items'].each do |item|
      battle = item['battle']
      next unless battle['type'] == 'soloRanked'

      battle['teams'].each do |team|
        team.each do |player|
          tag = player['tag']
          trophies = player['brawler']['trophies']

          # より新しい情報（高いtrophies）で更新
          if !player_rank_updates[tag] || player_rank_updates[tag] < trophies
            player_rank_updates[tag] = trophies
          end
        end
      end
    end

    # データベースの更新
    player_rank_updates.each do |tag, rank|
      player = Player.find_by(tag: tag)
      if player
        player.update(rank: rank)
        Rails.logger.info("Updated rank for player #{tag}: #{rank}")
      end
    end

    Rails.logger.info("UpdateSoloRankedRanksJob completed. Updated #{player_rank_updates.size} players.")
  rescue StandardError => e
    Rails.logger.error("UpdateSoloRankedRanksJob failed: #{e.message}")
    Rails.logger.error(e.backtrace.join("\n"))
    raise e
  end
end
