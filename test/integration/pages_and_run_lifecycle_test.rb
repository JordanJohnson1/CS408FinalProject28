require "test_helper"

class PagesAndRunLifecycleTest < ActionDispatch::IntegrationTest
  test "public pages render successfully" do
    get root_path
    assert_response :success
    assert_includes @response.body, "Stick Skater"

    get shop_path
    assert_response :success
    assert_includes @response.body, "Upgrade your stick skater"

    get leaderboard_path
    assert_response :success
    assert_includes @response.body, "Leaderboard"

    get rails_health_check_path
    assert_response :success
  end

  test "json run endpoints require a current player" do
    post runs_path, headers: { "Accept" => "application/json" }

    assert_response :unauthorized
    assert_equal "Player required", JSON.parse(response.body)["error"]
  end

  test "finishing a run stores duration and finished status" do
    post players_path, params: { player: { name: "LifecycleFinisher", avatar_color: "#101010" } }

    post runs_path, headers: { "Accept" => "application/json" }
    assert_response :created
    run_id = JSON.parse(response.body)["id"]

    patch run_path(run_id), params: { status: "finished", duration_ms: 4321 }, headers: { "Accept" => "application/json" }

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal "finished", body["status"]
    assert_equal 4321, body["duration_ms"]
  end

  test "cancelling a run updates its status" do
    post players_path, params: { player: { name: "LifecycleCanceller", avatar_color: "#202020" } }

    post runs_path, headers: { "Accept" => "application/json" }
    assert_response :created
    run_id = JSON.parse(response.body)["id"]

    patch run_path(run_id), params: { status: "cancelled" }, headers: { "Accept" => "application/json" }

    assert_response :success
    assert_equal "cancelled", JSON.parse(response.body)["status"]
  end
end
