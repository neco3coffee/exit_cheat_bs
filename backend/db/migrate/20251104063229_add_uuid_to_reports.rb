class AddUuidToReports < ActiveRecord::Migration[8.0]
  def change
    add_column :reports, :uuid, :string, null: false
    add_index :reports, :uuid, unique: true
  end
end
