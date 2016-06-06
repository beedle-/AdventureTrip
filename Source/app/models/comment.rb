class Comment < ActiveRecord::Base
  before_save :generate_timestamp

  def generate_timestamp
    self.creation_date = DateTime.now
  end

  belongs_to :trip
  belongs_to :user
end
