class Trip < ActiveRecord::Base
  has_many :comments
  has_many :stops
  belongs_to :transport
end
