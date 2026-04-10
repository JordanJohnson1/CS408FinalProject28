class Trick < ApplicationRecord
  has_many :run_tricks, dependent: :destroy
  has_many :runs, through: :run_tricks

  validates :name, presence: true, uniqueness: true
  validates :input_sequence, presence: true
  validates :base_xp, :base_coins, :difficulty, numericality: { greater_than_or_equal_to: 0 }

  DEFAULT_TRICKS = [
    { name: "Ollie", input_sequence: "space", base_xp: 20, base_coins: 5, difficulty: 1 },
    { name: "Kickflip", input_sequence: "left+space", base_xp: 45, base_coins: 12, difficulty: 2 },
    { name: "Heelflip", input_sequence: "right+space", base_xp: 45, base_coins: 12, difficulty: 2 },
    { name: "Pop Shuvit", input_sequence: "down+space", base_xp: 35, base_coins: 10, difficulty: 2 },
    { name: "Frontside Shuvit", input_sequence: "down+left+space", base_xp: 55, base_coins: 14, difficulty: 3 },
    { name: "Backside 180", input_sequence: "left+down+space", base_xp: 70, base_coins: 18, difficulty: 3 },
    { name: "Frontside 180", input_sequence: "right+down+space", base_xp: 70, base_coins: 18, difficulty: 3 },
    { name: "Manual", input_sequence: "up", base_xp: 30, base_coins: 8, difficulty: 1 },
    { name: "Nose Manual", input_sequence: "up+space", base_xp: 60, base_coins: 16, difficulty: 2 },
    { name: "50-50 Grind", input_sequence: "down+right", base_xp: 65, base_coins: 20, difficulty: 3 },
    { name: "Boardslide", input_sequence: "down+left", base_xp: 65, base_coins: 20, difficulty: 3 }
  ].freeze

  def self.seed_defaults
    DEFAULT_TRICKS.each do |attrs|
      find_or_create_by!(name: attrs[:name]) do |trick|
        trick.input_sequence = attrs[:input_sequence]
        trick.base_xp = attrs[:base_xp]
        trick.base_coins = attrs[:base_coins]
        trick.difficulty = attrs[:difficulty]
      end
    end
  end

  def reward(multiplier: 1.0)
    xp = (base_xp * multiplier).to_i
    coins = (base_coins * multiplier).to_i
    { xp:, coins: }
  end
end
