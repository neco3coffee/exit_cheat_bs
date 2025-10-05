class CreatePlayerNameHistories < ActiveRecord::Migration[8.0]
  def change
    create_table :player_name_histories do |t|
      t.references :player, null: false, foreign_key: true
      t.string :name
      t.integer :icon_id
      t.datetime :changed_at

      t.timestamps
    end

    add_index :player_name_histories, :name
  end
end
