class CreateReports < ActiveRecord::Migration[8.0]
  def change
    create_table :reports do |t|
      t.references :reporter, null: false, foreign_key: { to_table: :players }
      t.references :reported, null: false, foreign_key: { to_table: :players }
      t.integer :report_type, null: false
      t.string :video_url
      t.string :result_url
      t.boolean :approved, default: false
      t.text :reason
      t.jsonb :battle_data, null: false

      t.timestamps
    end
  end
end
