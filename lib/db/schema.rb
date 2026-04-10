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

ActiveRecord::Schema[8.1].define(version: 202604100004) do
  create_table "players", force: :cascade do |t|
    t.string "avatar_color", default: "#0ea5e9", null: false
    t.integer "best_combo", default: 0, null: false
    t.integer "coins", default: 0, null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.integer "total_coins_earned", default: 0, null: false
    t.integer "total_tricks", default: 0, null: false
    t.datetime "updated_at", null: false
    t.integer "xp", default: 0, null: false
    t.index ["name"], name: "index_players_on_name", unique: true
  end

  create_table "run_tricks", force: :cascade do |t|
    t.integer "coins_awarded", default: 0, null: false
    t.datetime "created_at", null: false
    t.string "input_used"
    t.datetime "occurred_at"
    t.integer "run_id", null: false
    t.boolean "success", default: true, null: false
    t.integer "trick_id", null: false
    t.datetime "updated_at", null: false
    t.integer "xp_awarded", default: 0, null: false
    t.index ["occurred_at"], name: "index_run_tricks_on_occurred_at"
    t.index ["run_id"], name: "index_run_tricks_on_run_id"
    t.index ["trick_id"], name: "index_run_tricks_on_trick_id"
  end

  create_table "runs", force: :cascade do |t|
    t.integer "coins_earned", default: 0, null: false
    t.datetime "created_at", null: false
    t.integer "duration_ms", default: 0, null: false
    t.datetime "ended_at"
    t.integer "player_id", null: false
    t.datetime "started_at"
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.integer "xp_earned", default: 0, null: false
    t.index ["created_at"], name: "index_runs_on_created_at"
    t.index ["player_id"], name: "index_runs_on_player_id"
    t.index ["status"], name: "index_runs_on_status"
  end

  create_table "tricks", force: :cascade do |t|
    t.integer "base_coins", default: 0, null: false
    t.integer "base_xp", default: 0, null: false
    t.datetime "created_at", null: false
    t.integer "difficulty", default: 1, null: false
    t.string "input_sequence", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_tricks_on_name", unique: true
  end

  add_foreign_key "run_tricks", "runs"
  add_foreign_key "run_tricks", "tricks"
  add_foreign_key "runs", "players"
end
