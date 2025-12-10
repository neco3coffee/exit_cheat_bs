require "set"

class Battle < ApplicationRecord
  belongs_to :player

  # star_player: APIのstarPlayer情報を保存するjsonb属性

  self.inheritance_column = :_type_disabled

  validates :battle_id, presence: true
  validates :battle_time, presence: true
  validates :rank, presence: true
  validates :battle_id, uniqueness: { scope: :player_id }

  before_validation :ensure_rounds_array
  after_commit :enqueue_missing_player_records, on: :create
  after_commit :update_player_last_active_at, on: :create

  class << self
    def calculate_brawler_stats(battles)
      battle_list = to_battle_array(battles)
      total_battles = battle_list.size
      return [] if total_battles.zero?

      stats = {}

      battle_list.each do |battle|
        player_entry = player_entry_for(battle)
        next unless player_entry

        brawler_id = extract_brawler_id(player_entry)
        next unless brawler_id

        stats[brawler_id] ||= {
          battle_count: 0,
          win_count: 0,
          gadgets: Set.new,
          star_powers: Set.new,
          gears: Set.new
        }

        stats[brawler_id][:battle_count] += 1
        stats[brawler_id][:win_count] += 1 if victory?(battle)
        stats[brawler_id][:gadgets].merge(collect_upgrade_ids(player_entry, "gadgets"))
        stats[brawler_id][:star_powers].merge(collect_upgrade_ids(player_entry, "starPowers"))
        stats[brawler_id][:gears].merge(collect_upgrade_ids(player_entry, "gears"))
      end

      stats.map do |id, data|
        pick_rate = data[:battle_count].positive? ? data[:battle_count].to_f / total_battles : 0.0
        win_rate = data[:battle_count].positive? ? data[:win_count].to_f / data[:battle_count] : 0.0

        {
          id: id,
          gadgets: data[:gadgets].to_a.sort,
          star_powers: data[:star_powers].to_a.sort,
          gears: data[:gears].to_a.sort,
          pick_rate: pick_rate.round(4),
          win_rate: win_rate.round(4),
          battle_count: data[:battle_count]
        }
      end.sort_by { |entry| [ -entry[:pick_rate], -entry[:win_rate], -entry[:battle_count] ] }
    end

    def calculate_mode_stats(battles)
      battle_list = to_battle_array(battles)
      return default_mode_stats if battle_list.empty?

      totals = Hash.new { |hash, key| hash[key] = { battle_count: 0, win_count: 0 } }

      battle_list.each do |battle|
        mode = detect_mode(battle)
        next if mode.blank?

        totals[mode][:battle_count] += 1
        totals[mode][:win_count] += 1 if victory?(battle)
      end

      default_modes = default_mode_stats

      totals.each do |mode, data|
        battle_count = data[:battle_count]
        win_rate = battle_count.positive? ? data[:win_count].to_f / battle_count : 0.0

        default_modes[mode.to_s] = {
          battle_count: battle_count,
          win_rate: win_rate.round(4)
        }
      end

      default_modes
    end

    def calculate_high_win_rate_teammates(player, battles, limit: 5)
      battle_list = to_battle_array(battles)
      return [] if battle_list.empty? || player.nil?

      player_tag = normalize_tag(player&.tag)
      return [] if player_tag.blank?

      stats = {}

      battle_list.each do |battle|
        teammates = teammate_players_for(battle, player_tag)
        next if teammates.empty?

        win = victory?(battle)

        teammates.each do |teammate|
          tag = normalize_tag(teammate["tag"] || teammate[:tag])
          next if tag.blank?

          stats[tag] ||= {
            battle_count: 0,
            win_count: 0,
            sample: teammate
          }

          stats[tag][:battle_count] += 1
          stats[tag][:win_count] += 1 if win
          stats[tag][:sample] = teammate if stats[tag][:sample].nil?
        end
      end

      filtered_stats = stats.select { |_tag, data| data[:battle_count] >= 3 }
      return [] if filtered_stats.empty?

      build_person_stats(filtered_stats, limit)
    end

    def calculate_most_defeated_enemies(player, battles, limit: 5)
      battle_list = to_battle_array(battles)
      return [] if battle_list.empty? || player.nil?

      player_tag = normalize_tag(player&.tag)
      return [] if player_tag.blank?

      stats = {}

      battle_list.each do |battle|
        enemies = enemy_players_for(battle, player_tag)
        next if enemies.empty?

        win = victory?(battle)

        enemies.each do |enemy|
          tag = normalize_tag(enemy["tag"] || enemy[:tag])
          next if tag.blank?

          stats[tag] ||= {
            battle_count: 0,
            win_count: 0,
            sample: enemy
          }

          stats[tag][:battle_count] += 1
          stats[tag][:win_count] += 1 if win
          stats[tag][:sample] = enemy if stats[tag][:sample].nil?
        end
      end

      filtered_stats = stats.select { |_tag, data| data[:battle_count] >= 3 }
      return [] if filtered_stats.empty?

      build_person_stats(filtered_stats, limit)
    end

    def brawler_pick_rate_by_map(map_id:)
      battles = Battle.where(map_id: map_id).where("rank >= ?", 20) # master2以上
      total_battles = battles.count
      return [] if total_battles.zero?

      stats = Hash.new { |hash, key| hash[key] = { picks: 0, wins: 0 } }

      battles.find_each do |battle|
        player_team_index = player_team_index_for(battle)

        Array.wrap(battle.teams).each_with_index do |team, index|
          team_outcome = team_outcome_for(team_index: index,
                                          player_team_index: player_team_index,
                                          battle_result: battle.result)

          Array.wrap(team).each do |player_data|
            brawler_id = extract_brawler_id(player_data)
            next unless brawler_id

            stats[brawler_id][:picks] += 1
            stats[brawler_id][:wins] += 1 if team_outcome == :win
          end
        end
      end

      stats.map do |brawler_id, values|
        pick_rate = values[:picks].positive? ? (values[:picks].to_f / total_battles) : 0.0
        win_rate = values[:picks].positive? ? (values[:wins].to_f / values[:picks]) : 0.0

        {
          brawler_id: brawler_id,
          battle_count: values[:picks],
          pick_rate: pick_rate.round(4),
          win_rate: win_rate.round(4)
        }
      end.sort_by { |stat| -stat[:pick_rate] }
    end

    private

    def build_person_stats(stats, limit)
      return [] if stats.empty?

      player_records = Player.where(tag: stats.keys).index_by(&:tag)

      stats.map do |tag, data|
        battle_count = data[:battle_count]
        win_rate = battle_count.positive? ? data[:win_count].to_f / battle_count : 0.0
        sample = data[:sample] || {}
        record = player_records[tag]

        {
          tag: tag,
          name: record&.name || sample["name"] || sample[:name] || "",
          icon_id: record&.icon_id || extract_icon_id(sample),
          rank: record&.rank || extract_rank(sample),
          battle_count: battle_count,
          win_rate: win_rate.round(4)
        }
      end.sort_by { |entry| [ -entry[:win_rate], -entry[:battle_count], entry[:tag] ] }
        .first(limit)
    end

    def extract_icon_id(player_data)
      icon = player_data["icon"] || player_data[:icon]
      icon_id = icon&.[]("id") || icon&.dig(:id)
      icon_id&.to_i || 0
    end

    def extract_rank(player_data)
      rank = player_data.dig("brawler", "trophies") || player_data.dig(:brawler, :trophies)
      rank&.to_i || 0
    end

    def to_battle_array(battles)
      return [] if battles.nil?

      if battles.is_a?(ActiveRecord::Relation)
        battles.to_a
      else
        Array.wrap(battles)
      end
    end

    def collect_upgrade_ids(player_data, key)
      Array.wrap(player_data[key] || player_data[key.to_sym]).filter_map do |item|
        id = if item.is_a?(Hash)
               item["id"] || item[:id]
        else
               item
        end

        next if id.blank?

        case id
        when Integer
          id
        when String
          stripped = id.strip
          stripped.match?(/\A\d+\z/) ? stripped.to_i : stripped
        else
          nil
        end
      end
    end

    def victory?(battle)
      battle.result.to_s.downcase == "victory"
    end

    def detect_mode(battle)
      return battle.mode if battle.mode.present?

      raw = battle.raw_data || {}
      battle_node = raw["battle"] || raw[:battle] || raw
      event_node = raw["event"] || raw[:event]

      battle_node&.[]("mode") || battle_node&.dig(:mode) || event_node&.[]("mode") || event_node&.dig(:mode)
    end

    def default_mode_stats
      {
        "knockout" => { battle_count: 0, win_rate: 0.0 },
        "gemGrab" => { battle_count: 0, win_rate: 0.0 },
        "heist" => { battle_count: 0, win_rate: 0.0 },
        "brawlBall" => { battle_count: 0, win_rate: 0.0 },
        "hotZone" => { battle_count: 0, win_rate: 0.0 },
        "bounty" => { battle_count: 0, win_rate: 0.0 }
      }
    end

    def groups_for_battle(battle)
      teams = battle.teams if battle.respond_to?(:teams)
      teams = teams.presence

      raw = battle.raw_data || {}
      battle_node = raw["battle"] || raw[:battle] || raw

      teams ||= battle_node&.[]("teams") || battle_node&.dig(:teams)
      teams ||= battle_node&.[]("players") || battle_node&.dig(:players)

      Array.wrap(teams).map { |group| Array.wrap(group) }
    end

    def player_entry_for(battle)
      player_tag = normalize_tag(battle.player&.tag)
      return unless player_tag

      groups_for_battle(battle).each do |group|
        group.each do |member|
          next unless member.is_a?(Hash)

          tag = normalize_tag(member["tag"] || member[:tag])
          return member if tag == player_tag
        end
      end

      nil
    end

    def teammate_players_for(battle, player_tag)
      player_tag = normalize_tag(player_tag)
      return [] if player_tag.blank?

      player_group = nil

      groups_for_battle(battle).each do |group|
        tags = team_member_tags(group)
        if tags.include?(player_tag)
          player_group = group
          break
        end
      end

      return [] unless player_group

      Array.wrap(player_group).filter_map do |member|
        next unless member.is_a?(Hash)
        tag = normalize_tag(member["tag"] || member[:tag])
        next if tag == player_tag

        member
      end
    end

    def enemy_players_for(battle, player_tag)
      player_tag = normalize_tag(player_tag)
      return [] if player_tag.blank?

      enemies = []

      groups_for_battle(battle).each do |group|
        tags = team_member_tags(group)
        next if tags.include?(player_tag)

        Array.wrap(group).each do |member|
          enemies << member if member.is_a?(Hash)
        end
      end

      enemies
    end

    def team_outcome_for(team_index:, player_team_index:, battle_result:)
      return :unknown if battle_result.blank?

      case battle_result.to_s.downcase
      when "draw"
        :draw
      when "victory"
        player_team_index == team_index ? :win : (player_team_index.nil? ? :unknown : :loss)
      when "defeat"
        player_team_index == team_index ? :loss : (player_team_index.nil? ? :unknown : :win)
      else
        :unknown
      end
    end

    def player_team_index_for(battle)
      player_tag = normalize_tag(battle.player&.tag)
      return unless player_tag

      Array.wrap(battle.teams).each_with_index do |team, index|
        return index if team_member_tags(team).include?(player_tag)
      end

      nil
    end

    def team_member_tags(team)
      Array.wrap(team).filter_map do |player_data|
        next unless player_data.is_a?(Hash)

        normalize_tag(player_data["tag"] || player_data[:tag])
      end
    end

    def extract_brawler_id(player_data)
      brawler = player_data&.[]("brawler") || player_data&.dig(:brawler)
      brawler&.[]("id") || brawler&.dig(:id)
    end

    def normalize_tag(tag)
      return if tag.blank?

      normalized = tag.to_s.upcase.strip
      normalized = normalized.gsub("O", "0")
      normalized.start_with?("#") ? normalized : "##{normalized}"
    end
  end

  private

  def enqueue_missing_player_records
    tags = participant_tags_for_player_fetch
    return if tags.empty?

    EnsurePlayersJob.set(priority: 10).perform_later(tags)
  rescue StandardError => e
  end

  def update_player_last_active_at
    return unless player

    player.update_column(:last_active_at, battle_time || created_at)
  rescue StandardError => e
  end

  def participant_tags_for_player_fetch
    tags = []

    participant_groups = self.class.send(:groups_for_battle, self)
    participant_groups.each do |group|
      Array.wrap(group).each do |member|
        next unless member.is_a?(Hash)

        tag = member["tag"] || member[:tag]
        tags << tag if tag.present?
      end
    end

    tags << player&.tag if player&.tag.present?
    tags.compact.uniq
  end

  def ensure_rounds_array
    self.rounds ||= []
  end
end
