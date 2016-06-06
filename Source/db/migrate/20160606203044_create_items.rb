class CreateItems < ActiveRecord::Migration
  def change
    create_table :items do |t|
      t.string :name
      t.integer :trip_id

      t.timestamps null: false
    end
    add_index :items, :trip_id
  end
end
