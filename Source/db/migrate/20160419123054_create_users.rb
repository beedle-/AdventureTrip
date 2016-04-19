class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :user_name
      t.string :first_name
      t.string :family_name
      t.boolean :super_admin
      t.string :phone

      t.timestamps null: false
    end
  end
end
