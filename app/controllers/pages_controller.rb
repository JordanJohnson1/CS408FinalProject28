class PagesController < ApplicationController
  before_action :ensure_default_tricks, only: :play

  def landing
    @player = current_player || Player.new
  end

  def play
    @player = current_player || Player.new
    @tricks = Trick.order(:difficulty, :name)
  end

  def shop
    @shop_upgrades = Player::SHOP_UPGRADES
    @owned_upgrade_keys = current_player&.owned_upgrade_keys || []
  end

  def leaderboard
    @top_players = Player.leaderboard.limit(10)
    @recent_runs = Run.finished.includes(:player).order(created_at: :desc).limit(10)
    @current_player_rank = Player.leaderboard.where(
      "coins > :coins OR (coins = :coins AND best_combo > :best_combo) OR (coins = :coins AND best_combo = :best_combo AND total_tricks > :total_tricks) OR (coins = :coins AND best_combo = :best_combo AND total_tricks = :total_tricks AND created_at < :created_at)",
      coins: current_player&.coins.to_i,
      best_combo: current_player&.best_combo.to_i,
      total_tricks: current_player&.total_tricks.to_i,
      created_at: current_player&.created_at || Time.current
    ).count + 1 if current_player
  end

  private

  def ensure_default_tricks
    Trick.seed_defaults if Trick.none?
  end
end
