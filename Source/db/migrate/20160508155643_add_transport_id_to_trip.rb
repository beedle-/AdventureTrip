class AddTransportIdToTrip < ActiveRecord::Migration
  def change
  	add_column :trips, :transport_id, :integer
  end
end
