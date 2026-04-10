class Trick < ApplicationRecord
  has_many :run_tricks, dependent: :destroy
  has_many :runs, through: :run_tricks

  validates :name, presence: true, uniqueness: true
  validates :input_sequence, presence: true
  validates :base_xp, :base_coins, :difficulty, numericality: { greater_than_or_equal_to: 0 }

  def reward(multiplier: 1.0)
    xp = (base_xp * multiplier).to_i
    coins = (base_coins * multiplier).to_i
    { xp:, coins: }
  end
end
