class Session < ApplicationRecord
  belongs_to :player
  validates :session_token, presence: true, uniqueness: true
  validates :expires_at, presence: true

  scope :active, -> { where('expires_at > ?', Time.current) }

  def expired?
    expires_at < Time.current
  end
end