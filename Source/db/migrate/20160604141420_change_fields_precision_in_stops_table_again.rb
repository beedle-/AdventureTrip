class ChangeFieldsPrecisionInStopsTableAgain < ActiveRecord::Migration
  def change
      change_column :stops, :loc_lon, :decimal, :precision => 17, :scale => 15
      change_column :stops, :loc_lat, :decimal, :precision => 17, :scale => 15
  end
end
