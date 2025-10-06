class CreatePlayers < ActiveRecord::Migration[8.0]
  def change
    create_table :players do |t|
      t.string :tag, null: false
      t.string :name
      t.integer :icon_id
      t.string :club_name
      t.integer :rank, null: false, default: 0
      t.integer :trophies, null: false, default: 0
      t.integer :approved_reports_count, null: false, default: 0

      t.timestamps
    end

    add_index :players, :tag, unique: true
    add_index :players, :name
    add_index :players, :rank
  end
end
