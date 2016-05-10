# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160508134924) do

  create_table "comments", force: :cascade do |t|
    t.text    "text",    limit: 4294967295, null: false
    t.integer "trip_id", limit: 4,          null: false
    t.integer "user_id", limit: 4,          null: false
  end

  create_table "permission_types", force: :cascade do |t|
    t.string "permission", limit: 255, null: false
  end

  create_table "permissions", force: :cascade do |t|
    t.integer "user_id",            limit: 4, null: false
    t.integer "trip_id",            limit: 4, null: false
    t.integer "permission_type_id", limit: 4, null: false
  end

  create_table "stops", force: :cascade do |t|
    t.string  "title",    limit: 255, null: false
    t.integer "loc_lon",  limit: 4,   null: false
    t.integer "loc_lat",  limit: 4,   null: false
    t.integer "trip_id",  limit: 4,   null: false
    t.integer "etape_nb", limit: 4,   null: false
  end

  create_table "transports", force: :cascade do |t|
    t.string  "transports", limit: 255, null: false
    t.integer "trip_id",    limit: 4,   null: false
  end

  create_table "trips", force: :cascade do |t|
    t.string   "title",        limit: 255
    t.text     "description",  limit: 65535
    t.boolean  "public"
    t.datetime "start_date"
    t.datetime "end_date"
    t.integer  "transport_id", limit: 4
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
  end

  create_table "users", force: :cascade do |t|
    t.string   "user_name",              limit: 255
    t.string   "first_name",             limit: 255
    t.string   "family_name",            limit: 255
    t.boolean  "super_admin"
    t.string   "phone",                  limit: 255
    t.datetime "created_at",                                      null: false
    t.datetime "updated_at",                                      null: false
    t.string   "email",                  limit: 255, default: "", null: false
    t.string   "encrypted_password",     limit: 255, default: "", null: false
    t.string   "reset_password_token",   limit: 255
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          limit: 4,   default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip",     limit: 255
    t.string   "last_sign_in_ip",        limit: 255
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

end
