require "test_helper"

class TrickTest < ActiveSupport::TestCase
  test "reward scales with multiplier" do
    trick = Trick.create!(name: "Kickflip", input_sequence: "left+space", base_xp: 40, base_coins: 10, difficulty: 2)

    reward = trick.reward(multiplier: 1.5)

    assert_equal 60, reward[:xp]
    assert_equal 15, reward[:coins]
  end
end
