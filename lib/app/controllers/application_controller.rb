class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # Changes to the importmap will invalidate the etag for HTML responses
  stale_when_importmap_changes

  helper_method :current_player

  private

  def current_player
    @current_player ||= Player.find_by(id: session[:player_id]) if session[:player_id]
  end

  def require_player!
    return if current_player

    respond_to do |format|
      format.html { redirect_to new_player_path, alert: "Create a player first" }
      format.json { render json: { error: "Player required" }, status: :unauthorized }
      format.any { head :unauthorized }
    end
  end
end
