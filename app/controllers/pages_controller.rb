class PagesController < ApplicationController
  def landing
    @player = current_player || Player.new
  end

  def play
    @player = current_player || Player.new
    @tricks = Trick.order(:difficulty, :name)
  end

  def shop; end

  def leaderboard
    @top_players = Player.order(coins: :desc).limit(10)
    @recent_runs = Run.includes(:player).order(created_at: :desc).limit(10)
  end
end
