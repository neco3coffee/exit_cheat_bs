class CreateBattles < ActiveRecord::Migration[8.0]
  def change
    create_table :battles do |t|
      t.references :player, null: false, foreign_key: true
      t.integer :rank, null: false
      t.string :battle_id, null: false
      t.datetime :battle_time, null: false
      t.string :mode
      t.string :type
      t.string :result
      t.string :map
      t.jsonb :teams
      t.jsonb :rounds
      t.jsonb :raw_data

      t.timestamps
    end

    add_index :battles, :battle_time
    add_index :battles, :battle_id
    add_index :battles, [ :player_id, :battle_id ], unique: true
    add_index :battles, :mode
    add_index :battles, :type
    add_index :battles, :result
    add_index :battles, :map
    add_index :battles, :teams, using: :gin
  end
end
