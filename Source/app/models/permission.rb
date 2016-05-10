class Permission < ActiveRecord::Base
	belongs_to :trip
	belongs_to :user
	belongs_to :persmission_type
end
