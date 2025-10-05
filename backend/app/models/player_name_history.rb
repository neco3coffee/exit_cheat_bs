class PlayerNameHistory < ApplicationRecord
  belongs_to :player

  validates :name, presence: true
  validates :changed_at, presence: true
end
