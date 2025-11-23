class AddStarPlayerToBattles < ActiveRecord::Migration[7.0]
  def change
    add_column :battles, :star_player, :jsonb, null: true
  end
end
