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
          tag = normalize_tag(player['tag'])
          trophies = player['brawler']['trophies']
          rank_tier = trophies_to_rank_tier(trophies)

          unless player_rank_updates.key?(tag)
            player_rank_updates[tag] = rank_tier
          end
        end
      end
    end

    # データベースの更新
    player_rank_updates.each do |tag, rank_tier|
      player = Player.find_by(tag: tag)
      if player
        old_rank = player.rank
        player.update(rank: rank_tier)
        Rails.logger.info("Updated rank for player #{tag}: #{old_rank} -> #{rank_tier}")
      end
    end

    Rails.logger.info("UpdateSoloRankedRanksJob completed. Updated #{player_rank_updates.size} players.")
  rescue StandardError => e
    Rails.logger.error("UpdateSoloRankedRanksJob failed: #{e.message}")
    Rails.logger.error(e.backtrace.join("\n"))
    raise e
  end

  private

  def normalize_tag(tag)
    return '' unless tag.present?

    tag = tag.to_s.upcase.strip
    tag = tag.gsub('O', '0')
    tag = "##{tag}" unless tag.start_with?('#')
    tag
  end

  # Convert trophy count to rank tier (0-21)
  def trophies_to_rank_tier(trophies)
    return 0 if trophies.nil? || trophies < 0

    case trophies
    when 0...100 then 0
    when 100...200 then 1
    when 200...300 then 2
    when 300...400 then 3
    when 400...500 then 4
    when 500...600 then 5
    when 600...700 then 6
    when 700...800 then 7
    when 800...900 then 8
    when 900...1000 then 9
    when 1000...1100 then 10
    when 1100...1200 then 11
    when 1200...1300 then 12
    when 1300...1400 then 13
    when 1400...1500 then 14
    when 1500...1600 then 15
    when 1600...1700 then 16
    when 1700...1800 then 17
    when 1800...1900 then 18
    when 1900...2000 then 19
    when 2000...2100 then 20
    else 21
    end
  end
end
