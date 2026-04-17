require "test_helper"

class PlayerTest < ActiveSupport::TestCase
  test "requires name" do
    player = Player.new
    assert_not player.valid?
    assert_includes player.errors[:name], "can't be blank"
  end

  test "adds rewards and updates totals" do
    player = Player.create!(name: "Tester")

    player.add_rewards!(xp: 10, coins: 5, combo_count: 3)

    assert_equal 10, player.xp
    assert_equal 5, player.coins
    assert_equal 3, player.best_combo
    assert_equal 1, player.total_tricks
    assert_equal 5, player.total_coins_earned
  end

  test "purchasing an upgrade stores ownership and deducts coins" do
    player = Player.create!(name: "Buyer", coins: 1_000)

    upgrade = player.purchase_upgrade!("maple_street_deck")

    assert_equal "Maple street deck", upgrade[:name]
    assert_equal 50, player.coins
    assert_includes player.owned_upgrade_keys, "maple_street_deck"
  end

  test "upgrade bonuses increase future trick rewards" do
    player = Player.create!(name: "Boosted", coins: 1_200)
    trick = Trick.new(name: "Bonus Flip", input_sequence: "space", base_xp: 100, base_coins: 100, difficulty: 1)

    player.purchase_upgrade!("ceramic_bearings")
    player.purchase_upgrade!("griptape_flair")

    rewards = player.reward_for(trick, multiplier: 1.0)

    assert_equal 115, rewards[:coins]
    assert_equal 105, rewards[:xp]
  end
end
