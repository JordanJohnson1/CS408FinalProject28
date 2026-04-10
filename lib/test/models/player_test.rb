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
end
