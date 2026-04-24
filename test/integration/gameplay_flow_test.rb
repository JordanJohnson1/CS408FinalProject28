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

  test "buying an upgrade deducts coins and persists ownership" do
    post players_path, params: { player: { name: "Shopper", avatar_color: "#112233" } }
    player = Player.find_by!(name: "Shopper")
    player.update!(coins: 1_000)

    post shop_upgrade_purchase_path("maple_street_deck")

    assert_redirected_to shop_path
    player.reload
    assert_equal 50, player.coins
    assert_includes player.owned_upgrade_keys, "maple_street_deck"
  end

  test "a new run still logs tricks after buying an upgrade" do
    post players_path, params: { player: { name: "PostShopRunner", avatar_color: "#445566" } }
    player = Player.find_by!(name: "PostShopRunner")
    player.update!(coins: 1_000)
    trick = Trick.create!(name: "Store Kickflip", input_sequence: "up", base_xp: 10, base_coins: 3, difficulty: 1)

    post shop_upgrade_purchase_path("maple_street_deck")
    assert_redirected_to shop_path

    post runs_path, headers: { "Accept" => "application/json" }
    assert_response :created
    run_id = JSON.parse(response.body)["id"]

    post run_tricks_path, params: { run_id: run_id, trick_id: trick.id, input_used: "up" }, headers: { "Accept" => "application/json" }
    assert_response :success

    body = JSON.parse(response.body)
    assert_equal 3, body.dig("run", "coins_earned")
    assert_equal 10, body.dig("run", "xp_earned")
  end

  test "leaderboard orders players and links to profiles" do
    low = Player.create!(name: "LowScore", coins: 100, best_combo: 2, total_tricks: 10)
    high = Player.create!(name: "HighScore", coins: 300, best_combo: 5, total_tricks: 20)

    get leaderboard_path

    assert_response :success
    assert_operator @response.body.index(high.name), :<, @response.body.index(low.name)
    assert_includes @response.body, player_path(high)
  end

  test "own profile shows reset controls but public profile does not" do
    post players_path, params: { player: { name: "ProfileOwner", avatar_color: "#abcdef" } }
    owner = Player.find_by!(name: "ProfileOwner")
    other = Player.create!(name: "ProfileVisitor", avatar_color: "#fedcba")

    get player_path(owner)
    assert_response :success
    assert_includes @response.body, "Reset progress"
    assert_includes @response.body, "Delete player"

    get player_path(other)
    assert_response :success
    assert_not_includes @response.body, "Reset progress"
    assert_not_includes @response.body, "Delete player"
  end

  test "resetting a player clears progress" do
    post players_path, params: { player: { name: "ResetFlow", avatar_color: "#111111" } }
    player = Player.find_by!(name: "ResetFlow")
    player.update!(coins: 250, xp: 100, best_combo: 4, total_tricks: 9, total_coins_earned: 250, owned_upgrades: ["maple_street_deck"].to_json)
    player.runs.create!(status: :finished, started_at: Time.current, ended_at: Time.current, coins_earned: 10, xp_earned: 5)

    patch reset_player_path(player)

    assert_redirected_to player_path(player)
    player.reload
    assert_equal 0, player.coins
    assert_equal 0, player.xp
    assert_equal 0, player.best_combo
    assert_equal 0, player.total_tricks
    assert_equal 0, player.total_coins_earned
    assert_empty player.owned_upgrade_keys
    assert_equal 0, player.runs.count
  end

  test "deleting the current player removes the account" do
    post players_path, params: { player: { name: "DeleteFlow", avatar_color: "#222222" } }
    player = Player.find_by!(name: "DeleteFlow")

    delete player_path(player)

    assert_redirected_to root_path
    assert_nil Player.find_by(id: player.id)
  end
end
