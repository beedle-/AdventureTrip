class Trip < ActiveRecord::Base
  has_many :comments
  has_many :stops
  has_many :permissions
  belongs_to :transport
end
