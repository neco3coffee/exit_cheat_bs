class ModifyPointEventsUniqueIndex < ActiveRecord::Migration[8.0]
  def change
    remove_index :point_events, name: :idx_unique_player_daily_point
    add_index :point_events, [ :player_id, :reason, :granted_on ], unique: true, where: "reason IN ('daily_login', 'first_report')", name: :idx_unique_player_daily_point_limited
  end
end
