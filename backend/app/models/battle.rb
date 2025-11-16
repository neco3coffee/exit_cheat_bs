class Battle < ApplicationRecord
  belongs_to :player

  self.inheritance_column = :_type_disabled

  validates :battle_id, presence: true
  validates :battle_time, presence: true
  validates :rank, presence: true
  validates :battle_id, uniqueness: { scope: :player_id }

  before_validation :ensure_rounds_array

  class << self
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
          pick_rate: pick_rate.round(4),
          win_rate: win_rate.round(4)
        }
      end.sort_by { |stat| -stat[:pick_rate] }
    end

    private

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

  def ensure_rounds_array
    self.rounds ||= []
  end
end
