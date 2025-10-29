class Report < ApplicationRecord
  # reporter_tag, reported_tag で Player と紐付けるアソシエーション
  belongs_to :reporter, class_name: 'Player', primary_key: :tag, foreign_key: :reporter_tag, optional: true
  belongs_to :reported, class_name: 'Player', primary_key: :tag, foreign_key: :reported_tag, optional: true

  # 必要に応じてバリデーションを追加
  validates :reporter_tag, presence: true
  validates :reported_tag, presence: true
  validates :report_type, presence: true
  validates :battle_data, presence: true

  after_update :increment_approved_reports_count

  private

  def increment_approved_reports_count
    if reported.nil?
      fetcher = PlayerFetcher.new
      player_data = fetcher.fetch_player(reported_tag)
      if player_data.present?
        reported_player = Player.create(
          tag: player_data["tag"],
          name: player_data["name"],
          club_name: player_data.dig("club", "name"),
          trophies: player_data["trophies"],
          icon_id: player_data.dig("icon", "id").to_s
        )
        self.reported = reported_player
        save!
      else
        Rails.logger.error("Failed to fetch player data for tag: #{reported_tag}")
        return
      end
    end

    if saved_change_to_status? && status == 'approved' && ['pending', 'waiting_review'].include?(status_before_last_save)
      reported.increment!(:approved_reports_count)
    end
  end
end
