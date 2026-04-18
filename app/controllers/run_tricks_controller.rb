class RunTricksController < ApplicationController
  before_action :require_player!

  def create
    run = current_player.runs.find(run_trick_params[:run_id])
    trick = Trick.find(run_trick_params[:trick_id])

    rewards = run.apply_trick!(
      trick:,
      input_used: run_trick_params[:input_used],
      success: run_trick_params.fetch(:success, true),
      occurred_at: Time.current
    )

    render json: {
      run: run.as_json(only: %i[id status coins_earned xp_earned]),
      player: run.player.as_json(only: %i[id name coins xp best_combo total_tricks total_coins_earned]),
      rewards:
    }
  rescue ActiveRecord::RecordNotFound => e
    render json: { error: e.message }, status: :not_found
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  private

  def run_trick_params
    params.permit(:run_id, :trick_id, :input_used, :success)
  end
end
