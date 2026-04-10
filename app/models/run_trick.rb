class RunTrick < ApplicationRecord
  belongs_to :run
  belongs_to :trick

  delegate :player, to: :run

  validates :xp_awarded, :coins_awarded, numericality: { greater_than_or_equal_to: 0 }
  validates :success, inclusion: { in: [true, false] }
end
