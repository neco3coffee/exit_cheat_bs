# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_10_05_130423) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "btree_gin"
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pg_trgm"
  enable_extension "unaccent"

  create_table "player_name_histories", force: :cascade do |t|
    t.bigint "player_id", null: false
    t.string "name"
    t.integer "icon_id"
    t.datetime "changed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_player_name_histories_on_name"
    t.index ["player_id"], name: "index_player_name_histories_on_player_id"
  end

  create_table "players", force: :cascade do |t|
    t.string "tag", null: false
    t.string "name"
    t.integer "icon_id"
    t.string "club_name"
    t.integer "rank", default: 0, null: false
    t.integer "trophies", default: 0, null: false
    t.integer "approved_reports_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_players_on_name"
    t.index ["rank"], name: "index_players_on_rank"
    t.index ["tag"], name: "index_players_on_tag", unique: true
  end

  create_table "reports", force: :cascade do |t|
    t.bigint "reporter_id", null: false
    t.bigint "reported_id", null: false
    t.integer "report_type", null: false
    t.string "video_url"
    t.string "result_url"
    t.boolean "approved", default: false
    t.text "reason"
    t.jsonb "battle_data", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["reported_id"], name: "index_reports_on_reported_id"
    t.index ["reporter_id"], name: "index_reports_on_reporter_id"
  end

  create_table "tests", force: :cascade do |t|
    t.string "name", limit: 255, null: false
    t.string "normalized_name", limit: 255
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index "lower((name)::text)", name: "index_tests_name_lower"
    t.index ["name"], name: "index_tests_on_name"
    t.index ["normalized_name"], name: "index_tests_on_normalized_name"
    t.check_constraint "char_length(name::text) <= 15", name: "check_name_length"
  end

  add_foreign_key "player_name_histories", "players"
  add_foreign_key "reports", "players", column: "reported_id"
  add_foreign_key "reports", "players", column: "reporter_id"
end
