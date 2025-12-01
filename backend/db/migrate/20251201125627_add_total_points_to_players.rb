class AddTotalPointsToPlayers < ActiveRecord::Migration[8.0]
  def change
    add_column :players, :total_points, :integer, null: false, default: 0
    add_index :players, :total_points
  end
end
