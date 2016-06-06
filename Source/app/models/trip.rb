class Trip < ActiveRecord::Base
  has_many :comments
  has_many :items
  has_many :stops
  has_many :permissions
  has_many :users, through: :permissions
  belongs_to :transport
end
