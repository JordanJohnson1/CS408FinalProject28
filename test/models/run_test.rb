require "test_helper"

class RunTest < ActiveSupport::TestCase
  test "apply_trick persists rewards" do
    player = Player.create!(name: "Runner")
    trick = Trick.create!(name: "Ollie", input_sequence: "space", base_xp: 20, base_coins: 5, difficulty: 1)
    run = player.runs.create!(status: :active)

    run.apply_trick!(trick: trick, input_used: "space")

    run.reload
    player.reload
    assert_equal 20, run.xp_earned
    assert_equal 5, run.coins_earned
    assert_equal 20, player.xp
    assert_equal 5, player.coins
    assert_equal 1, player.best_combo
  end

  test "apply_trick derives combo rewards from run history" do
    player = Player.create!(name: "Combo Runner")
    trick = Trick.create!(name: "Kickflip", input_sequence: "left+space", base_xp: 20, base_coins: 5, difficulty: 1)
    run = player.runs.create!(status: :active)
    first_time = Time.current

    run.apply_trick!(trick: trick, input_used: "left+space", occurred_at: first_time)
    run.apply_trick!(trick: trick, input_used: "left+space", occurred_at: first_time + 1.second)

    run.reload
    player.reload
    assert_equal 44, run.xp_earned
    assert_equal 11, run.coins_earned
    assert_equal 44, player.xp
    assert_equal 11, player.coins
    assert_equal 2, player.best_combo
  end
end
