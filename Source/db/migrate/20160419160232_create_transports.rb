class CreateTransports < ActiveRecord::Migration
  def change
    create_table :transports do |t|

      t.timestamps null: false
    end
  end
end
