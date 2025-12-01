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
      post "players/:tag/auto_save", to: "players#toggle_player_auto_save"
      get "players/:tag/stats", to: "players#stats"
      get "players/:tag/reported_players", to: "players#reported_players"
      get "players/:tag/battlelog", to: "players#battlelog"
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
      post "reports/:id/signed_url", to: "reports#signed_url"
      post "reports/:id/report_reported_player", to: "reports#report_reported_player"
      post "reports/:id/report_report_type", to: "reports#report_report_type"
      post "reports/:id/voted", to: "reports#voted"
      resources :reports, only: [ :create, :show, :update, :index ], param: :id
      post "update_video", to: "reports#update_video"

      resources :points, only: [] do
        collection do
          get :undisplayed
        end
        member do
          post :mark_displayed
        end
      end

      post "ranked/battle_logs/auto_save", to: "players#toggle_battle_log_auto_save"


      get "maps/:id/brawler_pick_rate", to: "battles#map_brawler_pick_rate"
      get "maps", to: "battles#maps"

      get "seasons/current/rankings", to: "players#season_rankings"
      get "seasons/current", to: "seasons#current"


      get "stats", to: "stats#index"
    end
  end
end
