class PointEvent < ApplicationRecord
  belongs_to :player
  belongs_to :related, polymorphic: true, optional: true

  enum :reason, {
    daily_login: "daily_login",
    first_report: "first_report",
    report_approved: "report_approved",
    auto_battle: "auto_battle",
    campaign: "campaign",
    manual_adjustment: "manual_adjustment"
  }

  scope :undisplayed, -> { where(displayed: false) }
end
