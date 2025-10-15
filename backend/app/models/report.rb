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
    if saved_change_to_status? && status == 'approved' && status_before_last_save == 'waiting_review'
      reported.increment!(:approved_reports_count)
    end
  end
end
