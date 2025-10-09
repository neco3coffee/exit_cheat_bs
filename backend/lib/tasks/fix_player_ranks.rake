namespace :data do
  desc "Fix player ranks by converting trophy counts to rank tiers"
  task fix_player_ranks: :environment do
    puts "Starting player rank migration..."
    
    # Method to convert trophies to rank tier
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

    # Find players with rank > 21 (these likely have trophy counts instead of tiers)
    players_to_fix = Player.where('rank > 21')
    total_count = players_to_fix.count

    puts "Found #{total_count} players with rank > 21 (likely trophy counts)"

    if total_count == 0
      puts "No players need fixing. All ranks are already in the valid range (0-21)."
      next
    end

    fixed_count = 0
    error_count = 0

    players_to_fix.find_each do |player|
      old_rank = player.rank
      # Assume the current rank value is actually a trophy count
      new_rank = trophies_to_rank_tier(old_rank)
      
      begin
        player.update!(rank: new_rank)
        fixed_count += 1
        puts "Fixed player #{player.tag}: rank #{old_rank} → #{new_rank}"
      rescue => e
        error_count += 1
        puts "Error fixing player #{player.tag}: #{e.message}"
      end
    end

    puts "\nMigration complete!"
    puts "Total players processed: #{total_count}"
    puts "Successfully fixed: #{fixed_count}"
    puts "Errors: #{error_count}"
  end

  desc "Show statistics about player ranks"
  task rank_stats: :environment do
    puts "Player Rank Statistics"
    puts "=" * 50
    
    total_players = Player.count
    puts "Total players: #{total_players}"
    
    if total_players == 0
      puts "No players in database."
      next
    end

    # Count players by rank tier
    puts "\nRank Distribution:"
    (0..21).each do |tier|
      count = Player.where(rank: tier).count
      percentage = (count.to_f / total_players * 100).round(1)
      puts "Rank #{tier.to_s.rjust(2)}: #{count.to_s.rjust(6)} players (#{percentage}%)" if count > 0
    end

    # Find potential problems
    invalid_ranks = Player.where('rank > 21 OR rank < 0').count
    puts "\nPotential Issues:"
    puts "Players with rank > 21: #{Player.where('rank > 21').count}"
    puts "Players with rank < 0: #{Player.where('rank < 0').count}"
    
    if invalid_ranks > 0
      puts "\n⚠️  Warning: Found #{invalid_ranks} players with invalid rank values."
      puts "Run 'rake data:fix_player_ranks' to fix them."
    else
      puts "\n✅ All player ranks are in the valid range (0-21)."
    end
  end
end
