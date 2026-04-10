class RunsController < ApplicationController
  before_action :require_player!

  def create
    run = current_player.runs.create!(status: :active, started_at: Time.current)
    render json: run_payload(run), status: :created
  end

  def update
    run = current_player.runs.find(params[:id])

    if finish_params[:status] == "finished"
      run.update!(status: :finished, duration_ms: finish_params[:duration_ms], ended_at: Time.current)
    elsif finish_params[:status] == "cancelled"
      run.update!(status: :cancelled, ended_at: Time.current)
    end

    render json: run_payload(run)
  end

  private

  def finish_params
    params.permit(:status, :duration_ms)
  end

  def run_payload(run)
    run.as_json(only: %i[id status duration_ms coins_earned xp_earned started_at ended_at]).merge(
      player: run.player.as_json(only: %i[id name coins xp best_combo total_tricks total_coins_earned])
    )
  end
end
