class ChangeLonLatPrecisionInStopsTable < ActiveRecord::Migration
  def change
      change_column :stops, :loc_lon, :decimal, :precision => 15
      change_column :stops, :loc_lat, :decimal, :precision => 15
  end
end
