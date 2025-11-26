class AddLastActiveAtToPlayers < ActiveRecord::Migration[8.0]
  def change
    add_column :players, :last_active_at, :datetime

    add_index :players, :last_active_at
  end
end
