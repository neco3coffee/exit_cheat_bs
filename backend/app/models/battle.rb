class Battle < ApplicationRecord
  belongs_to :player

  self.inheritance_column = :_type_disabled

  validates :battle_id, presence: true
  validates :battle_time, presence: true
  validates :rank, presence: true
  validates :battle_id, uniqueness: { scope: :player_id }

  before_validation :ensure_rounds_array

  private

  def ensure_rounds_array
    self.rounds ||= []
  end
end
