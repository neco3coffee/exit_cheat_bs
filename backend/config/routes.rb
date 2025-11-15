Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"

  namespace :api do
    namespace :v1 do
      get "players/search", to: "players#search"
      get "players/:tag", to: "players#show"
      get "players/:tag/ranked", to: "players#ranked"
      get "players/:tag/reports", to: "players#reports"

      namespace :auth do
        post "login",  to: "sessions#login"
        post "verify", to: "sessions#verify"
        get "me", to: "sessions#me"
        get "logout", to: "sessions#logout"
      end

      get "reports/latest", to: "reports#latest"
      resources :reports, only: [ :create, :show, :update, :index ], param: :id
      post "reports/:id/signed_url", to: "reports#signed_url"
      post "update_video", to: "reports#update_video"
      post "reports/:id/voted", to: "reports#voted"

      post "ranked/battle_logs/auto_save", to: "players#toggle_battle_log_auto_save"


      get "stats", to: "stats#index"
    end
  end
end
