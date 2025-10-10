class CreateSessions < ActiveRecord::Migration[8.0]
  def change
    create_table :sessions do |t|
      t.references :player, null: false, foreign_key: true
      t.string :session_token, null: false
      t.datetime :expires_at, null: false

      t.timestamps
    end

    add_index :sessions, :session_token, unique: true
    add_index :sessions, :expires_at
  end
end
