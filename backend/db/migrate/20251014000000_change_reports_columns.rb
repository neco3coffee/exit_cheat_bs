class ChangeReportsColumns < ActiveRecord::Migration[8.0]
  def change
    # reporter_id -> reporter_tag
    remove_reference :reports, :reporter, foreign_key: { to_table: :players }, index: true
    add_column :reports, :reporter_tag, :string, null: false
    add_index :reports, :reporter_tag

    # reported_id -> reported_tag
    remove_reference :reports, :reported, foreign_key: { to_table: :players }, index: true
    add_column :reports, :reported_tag, :string, null: false
    add_index :reports, :reported_tag

    # approved -> status
    remove_column :reports, :approved, :boolean
    add_column :reports, :status, :string
  end
end
