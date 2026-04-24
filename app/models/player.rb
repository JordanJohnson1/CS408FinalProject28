require "json"
require "bigdecimal"

class Player < ApplicationRecord
  has_many :runs, dependent: :destroy
  has_many :run_tricks, through: :runs

  SHOP_UPGRADES = [
    {
      key: "maple_street_deck",
      name: "Maple street deck",
      category: "Deck",
      price: 950,
      bonus: "+10% trick coins",
      effect: { coin_multiplier: 0.10 }
    },
    {
      key: "carbon_fiber_deck",
      name: "Carbon fiber deck",
      category: "Deck",
      price: 1400,
      bonus: "+20% trick coins",
      effect: { coin_multiplier: 0.20 }
    },
    {
      key: "ceramic_bearings",
      name: "Ceramic bearings",
      category: "Bearings",
      price: 780,
      bonus: "+15% trick coins",
      effect: { coin_multiplier: 0.15 }
    },
    {
      key: "led_wheels",
      name: "LED wheels",
      category: "Wheels",
      price: 620,
      bonus: "+10% trick XP",
      effect: { xp_multiplier: 0.10 }
    },
    {
      key: "pro_trucks",
      name: "Pro trucks",
      category: "Trucks",
      price: 540,
      bonus: "+0.4s combo window",
      effect: { combo_reset_ms: 400 }
    },
    {
      key: "griptape_flair",
      name: "Griptape flair",
      category: "Flair",
      price: 300,
      bonus: "+5% trick XP",
      effect: { xp_multiplier: 0.05 }
    }
  ].freeze

  SHOP_UPGRADES_BY_KEY = SHOP_UPGRADES.index_by { |upgrade| upgrade[:key] }.freeze

  validates :name, presence: true, uniqueness: true, length: { maximum: 50 }
  validates :avatar_color, presence: true

  def reward_for(trick, multiplier: 1.0)
    base_rewards = trick.reward(multiplier:)

    {
      xp: (BigDecimal(base_rewards[:xp].to_s) * trick_xp_multiplier).to_i,
      coins: (BigDecimal(base_rewards[:coins].to_s) * trick_coin_multiplier).to_i
    }
  end

  def add_rewards!(xp:, coins:, combo_count: nil)
    self.xp += xp
    self.coins += coins
    self.total_tricks += 1
    self.total_coins_earned += coins
    self.best_combo = [best_combo, combo_count].compact.max if combo_count
    save!
  end

  def purchase_upgrade!(key)
    upgrade = SHOP_UPGRADES_BY_KEY[key.to_s]
    raise ArgumentError, "Upgrade not found" unless upgrade
    raise ArgumentError, "Upgrade already owned" if owns_upgrade?(upgrade[:key])
    raise ArgumentError, "Not enough coins" if coins < upgrade[:price]

    self.coins -= upgrade[:price]
    self.owned_upgrades = JSON.generate(owned_upgrade_keys + [upgrade[:key]])
    save!
    upgrade
  end

  def reset_progress!
    transaction do
      runs.destroy_all
      update!(
        best_combo: 0,
        coins: 0,
        owned_upgrades: JSON.generate([]),
        total_coins_earned: 0,
        total_tricks: 0,
        xp: 0
      )
    end
  end

  def owned_upgrade_keys
    JSON.parse(owned_upgrades.presence || "[]")
  rescue JSON::ParserError
    []
  end

  def owns_upgrade?(key)
    owned_upgrade_keys.include?(key.to_s)
  end

  def purchased_upgrades
    owned_upgrade_keys.filter_map { |key| SHOP_UPGRADES_BY_KEY[key] }
  end

  def trick_coin_multiplier
    BigDecimal("1") + purchased_upgrades.sum(BigDecimal("0")) { |upgrade| upgrade_effect_decimal(upgrade, :coin_multiplier) }
  end

  def trick_xp_multiplier
    BigDecimal("1") + purchased_upgrades.sum(BigDecimal("0")) { |upgrade| upgrade_effect_decimal(upgrade, :xp_multiplier) }
  end

  def combo_reset_ms
    3200 + purchased_upgrades.sum { |upgrade| upgrade.dig(:effect, :combo_reset_ms).to_i }
  end

  def self.leaderboard
    order(coins: :desc, best_combo: :desc, total_tricks: :desc, created_at: :asc)
  end

  def upgrade_effect_decimal(upgrade, effect_key)
    value = upgrade.dig(:effect, effect_key)
    return BigDecimal("0") if value.nil?

    BigDecimal(value.to_s)
  end
end
