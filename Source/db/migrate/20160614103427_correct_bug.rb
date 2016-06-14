class CorrectBug < ActiveRecord::Migration
  def change
      change_column :stops, :loc_lon, :decimal, :precision => 18, :scale => 15
      change_column :stops, :loc_lat, :decimal, :precision => 18, :scale => 15
  end
end
