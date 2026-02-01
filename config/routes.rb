Rails.application.routes.draw do
  get "home/index"

  # Make "/" go to Hello World page
  root "home#index"

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  get "up" => "rails/health#show", as: :rails_health_check
end
