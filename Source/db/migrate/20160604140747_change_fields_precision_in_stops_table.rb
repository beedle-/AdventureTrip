class ChangeFieldsPrecisionInStopsTable < ActiveRecord::Migration
  def change
      change_column :stops, :loc_lon, :decimal, :precision => 15, :scale => 13
      change_column :stops, :loc_lat, :decimal, :precision => 15, :scale => 1
  end
end
