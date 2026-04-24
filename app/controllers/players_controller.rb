class PlayersController < ApplicationController
  before_action :set_player, only: %i[show reset destroy]
  before_action :require_player!, only: %i[reset destroy]
  before_action :require_current_player!, only: %i[reset destroy]

  def new
    @player = Player.new
  end

  def create
    @player = Player.new(player_params)

    if @player.save
      session[:player_id] = @player.id
      redirect_to play_path, notice: "Player created! Let's skate."
    else
      flash.now[:alert] = @player.errors.full_messages.to_sentence
      render :new, status: :unprocessable_entity
    end
  end

  def show
    @recent_runs = @player.runs.finished.order(created_at: :desc).limit(8)
  end

  def reset
    @player.reset_progress!
    redirect_to player_path(@player), notice: "Progress reset. Fresh deck, fresh stats."
  end

  def destroy
    @player.destroy!
    reset_session if current_player == @player
    redirect_to root_path, notice: "Player deleted."
  end

  private

  def set_player
    @player = Player.find(params[:id])
  end

  def player_params
    params.require(:player).permit(:name, :avatar_color)
  end

  def require_current_player!
    return if current_player == @player

    redirect_to player_path(@player), alert: "You can only manage your own profile."
  end
end
