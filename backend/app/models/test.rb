class Test < ApplicationRecord
  validates :name, presence: true, length: { maximum: 15 }

  before_save :set_normalized_name

  # 部分一致検索（絵文字・多言語・大小文字無視対応）
  scope :search, ->(query) {
    return all if query.blank?

    sanitized_query = sanitize_sql_like(query.strip)
    where("name ILIKE ? OR normalized_name ILIKE ?", "%#{sanitized_query}%", "%#{sanitized_query}%")
      .order(:name)
  }

  private

  def set_normalized_name
    if name.present?
      # アクセント除去、小文字化、特殊文字の正規化
      self.normalized_name = name.unicode_normalize(:nfd)
                                .gsub(/[\u0300-\u036f]/, "") # 結合文字除去
                                .downcase
                                .strip
    end
  end

  def self.sanitize_sql_like(string)
    string.gsub(/[\\%_]/) { |match| "\\#{match}" }
  end
end
