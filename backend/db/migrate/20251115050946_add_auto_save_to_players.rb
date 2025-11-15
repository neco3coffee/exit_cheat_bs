class AddAutoSaveToPlayers < ActiveRecord::Migration[8.0]
  def change
    add_column :players, :auto_save_enabled, :boolean
    add_column :players, :auto_save_expires_at, :datetime
    add_index :players, [:auto_save_enabled, :auto_save_expires_at]
  end
end
