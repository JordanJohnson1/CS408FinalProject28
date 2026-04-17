class ShopUpgradesController < ApplicationController
  before_action :require_player!

  def create
    upgrade = current_player.purchase_upgrade!(params[:key])
    redirect_to shop_path, notice: "Purchased #{upgrade[:name]} and saved your progress."
  rescue ArgumentError => e
    redirect_to shop_path, alert: e.message
  end
end
