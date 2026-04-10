require "test_helper"

class RunTest < ActiveSupport::TestCase
  test "apply_trick persists rewards" do
    player = Player.create!(name: "Runner")
    trick = Trick.create!(name: "Ollie", input_sequence: "space", base_xp: 20, base_coins: 5, difficulty: 1)
    run = player.runs.create!(status: :active)

    run.apply_trick!(trick: trick, input_used: "space", multiplier: 2.0, combo_count: 2)

    run.reload
    player.reload
    assert_equal 40, run.xp_earned
    assert_equal 10, run.coins_earned
    assert_equal 40, player.xp
    assert_equal 10, player.coins
    assert_equal 2, player.best_combo
  end
end
