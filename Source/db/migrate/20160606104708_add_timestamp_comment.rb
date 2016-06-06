class AddTimestampComment < ActiveRecord::Migration
  def change
  	add_column :comments, :creation_date, :datetime
  end
end
