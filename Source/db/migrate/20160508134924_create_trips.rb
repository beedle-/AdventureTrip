class CreateTrips < ActiveRecord::Migration
  def change
    create_table :trips do |t|
      t.string :title
      t.text :description
      t.boolean :public
      t.datetime :start_date
      t.datetime :end_date
      t.integer :transport_id

      t.timestamps null: false
    end
  end
end
