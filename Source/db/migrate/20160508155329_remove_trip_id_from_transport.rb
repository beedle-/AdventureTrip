class RemoveTripIdFromTransport < ActiveRecord::Migration
  def change
  	remove_column :transports, :trip_id
  end
end
