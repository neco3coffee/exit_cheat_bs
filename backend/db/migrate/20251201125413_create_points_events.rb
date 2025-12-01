class CreatePointsEvents < ActiveRecord::Migration[8.0]
  def change
    create_table :point_events do |t|
      t.references :player, null: false, foreign_key: true

      t.integer :point, null: false                # +1, -10 など
      t.string  :reason, null: false               # daily_login, first_report, auto_battle など
      t.date    :granted_on, null: false           # 日次制御用（JST）

      t.boolean :displayed, null: false, default: false
      t.datetime :displayed_at

      t.string  :related_type                      # polymorphic
      t.bigint  :related_id

      t.timestamps
    end

    # ✅ 日次1回制御 + 二重付与物理ガード
    add_index :point_events,
      [ :player_id, :reason, :granted_on ],
      unique: true,
      name: "idx_unique_player_daily_point"

    # ✅ undisplayed API 高速化
    add_index :point_events, [ :player_id, :displayed ]

    # ✅ 日付検索・集計用
    add_index :point_events, :granted_on

    # ✅ polymorphic参照用
    add_index :point_events, [ :related_type, :related_id ]
  end
end
