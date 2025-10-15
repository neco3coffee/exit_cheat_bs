class AddRoleToPlayers < ActiveRecord::Migration[7.0]
  def change
    add_column :players, :role, :string, null: false, default: "user"
  end
end
