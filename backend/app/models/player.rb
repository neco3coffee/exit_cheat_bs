class Player < ApplicationRecord
  validates :tag, presence: true, uniqueness: true
  validates :name, presence: true
  validates :rank, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :trophies, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :approved_reports_count, presence: true, numericality: { greater_than_or_equal_to: 0 }

  # タグの正規化（先頭に#を追加）
  before_validation :normalize_tag

  private

  def normalize_tag
    if tag.present? && !tag.start_with?('#')
      self.tag = "##{tag}"
    end
    self.tag = tag&.upcase&.strip
  end
end
