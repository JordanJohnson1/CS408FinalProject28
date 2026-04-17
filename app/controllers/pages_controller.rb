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
    @top_players = Player.order(coins: :desc).limit(10)
    @recent_runs = Run.includes(:player).order(created_at: :desc).limit(10)
  end

  private

  def ensure_default_tricks
    Trick.seed_defaults if Trick.none?
  end
end
