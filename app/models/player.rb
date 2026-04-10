class Player < ApplicationRecord
  has_many :runs, dependent: :destroy
  has_many :run_tricks, through: :runs

  validates :name, presence: true, uniqueness: true, length: { maximum: 50 }
  validates :avatar_color, presence: true

  def add_rewards!(xp:, coins:, combo_count: nil)
    self.xp += xp
    self.coins += coins
    self.total_tricks += 1
    self.total_coins_earned += coins
    self.best_combo = [best_combo, combo_count].compact.max if combo_count
    save!
  end
end
