class ChangeLonLatFormatsInStopsTable < ActiveRecord::Migration
  def change
      change_column :stops, :loc_lon, :decimal
      change_column :stops, :loc_lat, :decimal
  end
end
