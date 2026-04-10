require "test_helper"

class GameplayFlowTest < ActionDispatch::IntegrationTest
  test "player creation works" do
    post players_path, params: { player: { name: "FlowTester", avatar_color: "#123456" } }

    assert_redirected_to play_path
    follow_redirect!
    assert_response :success
  end

  test "start a run and log a trick" do
    post players_path, params: { player: { name: "Runner", avatar_color: "#654321" } }
    trick = Trick.create!(name: "Manual", input_sequence: "up", base_xp: 10, base_coins: 3, difficulty: 1)

    post runs_path, headers: { "Accept" => "application/json" }
    assert_response :created
    run_id = JSON.parse(response.body)["id"]

    post run_tricks_path, params: { run_id: run_id, trick_id: trick.id, input_used: "up" }, headers: { "Accept" => "application/json" }
    assert_response :success

    body = JSON.parse(response.body)
    assert_equal trick.base_coins, body.dig("run", "coins_earned")
    assert_equal trick.base_xp, body.dig("run", "xp_earned")
  end
end
