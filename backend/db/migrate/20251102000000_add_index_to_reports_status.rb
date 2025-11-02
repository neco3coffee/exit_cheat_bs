class AddIndexToReportsStatus < ActiveRecord::Migration[8.0]
  def change
    add_index :reports, :status
  end
end
