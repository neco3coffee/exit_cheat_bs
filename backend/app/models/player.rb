class Player < ApplicationRecord
  has_many :player_name_histories, dependent: :destroy

  validates :tag, presence: true, uniqueness: true
  validates :name, presence: true
  # rank stores the rank tier (0-21) derived from solo ranked battle trophies
  # 0-21 represents different rank tiers in Brawl Stars ranked system
  validates :rank, presence: true, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 21 }
  validates :trophies, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :approved_reports_count, presence: true, numericality: { greater_than_or_equal_to: 0 }

  # タグの正規化（先頭に#を追加）
  before_validation :normalize_tag

  # SQLエスケープメソッド
  def self.sanitize_sql_like(string)
    string.gsub(/[\\%_]/) { |match| "\\#{match}" }
  end

  private

  def normalize_tag
    if tag.present? && !tag.start_with?('#')
      self.tag = "##{tag}"
    end
    self.tag = tag&.upcase&.strip
    self.tag = tag.gsub('O', '0') if tag  # Oを0に置換
  end
end
