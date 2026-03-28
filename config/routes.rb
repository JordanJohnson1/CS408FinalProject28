Rails.application.routes.draw do
  root "pages#landing"

  get "/play", to: "pages#play"
  get "/shop", to: "pages#shop"
  get "/leaderboard", to: "pages#leaderboard"

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  get "up" => "rails/health#show", as: :rails_health_check
end
