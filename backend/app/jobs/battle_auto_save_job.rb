class BattleAutoSaveJob < ApplicationJob
  queue_as :default

  def perform(player_id)
    player = Player.find_by(id: player_id)
    unless player
      return
    end

    battlelog_data = PlayerFetcher.new.fetch_battlelog(player.tag)

    unless battlelog_data.is_a?(Hash) && battlelog_data["items"].is_a?(Array)
      return
    end

    battlelog_data["items"].reverse.each do |item|
      process_battle_item(player, item)
    end

  rescue StandardError => e
    raise e
  end

  private

  def process_battle_item(player, item)
    battle = item["battle"]
    return unless battle
    return unless battle["type"] == "soloRanked"

    battle_time = parse_battle_time(item["battleTime"])
    return unless battle_time

    battle_signature = build_battle_signature(battle)
    existing_record = find_existing_battle(player, battle_signature, battle_time, item)

    if existing_record
      battle_id = existing_record.battle_id
      existing_record.with_lock do
        assign_battle_attributes(existing_record, player, item, battle_time)
        existing_record.save!
      end
    else
      battle_record = player.battles.new
      assign_battle_attributes(battle_record, player, item, battle_time)
      battle_record.save!

      # Grant auto battle point if victory
      if battle_record.result == "victory"
        PointGrantService.new(player).grant_auto_battle(battle_record)
      end
    end
  rescue ActiveRecord::RecordNotUnique
    existing_record = player.battles.find_by(battle_id: battle_id)
    return unless existing_record

    existing_record.with_lock do
      assign_battle_attributes(existing_record, player, item, battle_time)
      existing_record.save!
    end
  end

  def assign_battle_attributes(record, player, item, battle_time)
    battle = item["battle"] || {}
    battle_signature = build_battle_signature(battle)

    candidate_ranks = [ extract_player_rank(battle, player.tag), record.rank, player.rank ].compact
    record.rank = candidate_ranks.max || 0
    record.battle_time = [ record.battle_time, battle_time ].compact.max
  record.mode = battle["mode"] || item.dig("event", "mode")
  record.type = battle["type"]
  record.map = item.dig("event", "map") || battle["map"]
  record.map_id = extract_map_id(item) || record.map_id
    record.teams = battle["teams"] || battle["players"]
    record.star_player = battle["starPlayer"]
    record.raw_data = item

    new_rounds = merge_rounds(Array.wrap(record.rounds), build_round_entry(item))
    calculated_result = calculate_result_from_rounds(new_rounds) || battle["result"] || record.result

    record.rounds = new_rounds unless new_rounds == record.rounds
    record.result = calculated_result if calculated_result.present?

    record.battle_id = determine_battle_id(battle_signature, Array.wrap(record.rounds), record.battle_id)
  end

  def merge_rounds(existing_rounds, new_round)
    rounds = existing_rounds.map { |round| round.dup }
    index = rounds.index { |round| round["battleTime"] == new_round["battleTime"] }

    if index
      rounds[index] = rounds[index].merge(new_round)
    else
      rounds << new_round
    end

    rounds.sort_by { |round| round["battleTime"].to_s }
  end

  def build_round_entry(item)
    battle = item["battle"] || {}

    {
      "battleTime" => item["battleTime"],
      "result" => battle["result"],
      "duration" => battle["duration"]
    }.compact
  end

  def calculate_result_from_rounds(rounds)
    return if rounds.blank?

    victory_count = rounds.count { |round| round_result(round) == "victory" }
    defeat_count = rounds.count { |round| round_result(round) == "defeat" }

    return "victory" if victory_count >= 2
    return "defeat" if defeat_count >= 2
    return "ongoing" if rounds.size < 3

    "draw"
  end

  def round_result(round)
    return unless round.respond_to?(:[])

    round["result"] || round[:result]
  end

  def auto_save_active?(player)
  return false unless player.auto_save_enabled?

    expires_at = player.auto_save_expires_at
    expires_at.nil? || expires_at.future?
  end

  def parse_battle_time(value)
    return unless value

    Time.zone.strptime(value, "%Y%m%dT%H%M%S.%LZ")
  rescue ArgumentError
    nil
  end

  def build_battle_signature(battle)
    collect_tags(battle).join("-")
  end

  def determine_battle_id(signature, rounds, current_id)
    return current_id if signature.blank?

    times = rounds.filter_map do |round|
      parse_battle_time(round["battleTime"]) if round["battleTime"].present?
    end

    earliest = times.min
    return current_id unless earliest

    "#{signature}-#{earliest.utc.iso8601}"
  end

  def find_existing_battle(player, battle_signature, battle_time, item)
    candidate_records = player.battles
                               .where(type: "soloRanked")
                               .where("battle_time BETWEEN ? AND ?", battle_time - 15.minutes, battle_time + 15.minutes)

    candidate_records.detect do |record|
      same_battle?(record, battle_signature, item)
    end
  end

  def same_battle?(record, battle_signature, item)
    battle = item["battle"] || {}
    record_signature = extract_tags_from_record(record).join("-")
    return false unless record_signature == battle_signature

    record_map = record.map
    current_map = item.dig("event", "map") || battle["map"]
    (record_map.blank? || current_map.blank? || record_map == current_map)
  end

  def extract_tags_from_record(record)
    Array.wrap(record.teams).flat_map do |group|
      Array.wrap(group).map do |player|
        next unless player.is_a?(Hash)

        normalize_tag(player["tag"])
      end
    end.compact.sort
  end

  def collect_tags(battle)
    return [] unless battle

    groups = if battle["teams"].present?
               battle["teams"]
    elsif battle["players"].present?
               [ battle["players"] ]
    else
               []
    end

    groups.flat_map do |group|
      Array.wrap(group).map do |player|
        next unless player.is_a?(Hash)

        normalize_tag(player["tag"])
      end
    end.compact.sort
  end

  def extract_player_rank(battle, player_tag)
    normalized = normalize_tag(player_tag)
    groups = if battle["teams"].present?
               battle["teams"]
    elsif battle["players"].present?
               [ battle["players"] ]
    else
               []
    end

    groups.each do |group|
      Array.wrap(group).each do |entry|
        next unless entry.is_a?(Hash)
        next unless normalize_tag(entry["tag"]) == normalized

        return entry.dig("brawler", "trophies")
      end
    end

    nil
  end

  def normalize_tag(tag)
    return if tag.blank?

    normalized = tag.to_s.upcase.strip
    normalized = normalized.gsub("O", "0")
    normalized.start_with?("#") ? normalized : "##{normalized}"
  end

  def extract_map_id(item)
    raw_value = item.dig("event", "id")
    return if raw_value.blank?

    case raw_value
    when Integer
      raw_value
    when String
      value = raw_value.strip
      value.to_i if value.match?(/\A\d+\z/)
    end
  end
end
