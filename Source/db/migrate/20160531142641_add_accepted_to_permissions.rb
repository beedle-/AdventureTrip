class AddAcceptedToPermissions < ActiveRecord::Migration
  def change
  	add_column :permissions, :accepted, :boolean, :default => false
  end
end
