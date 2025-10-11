Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"

  namespace :api do
    namespace :v1 do
      get 'players/search', to: 'players#search'
      get 'players/:tag', to: 'players#show'
      get 'players/:tag/ranked', to: 'players#ranked'

      namespace :auth do
        post "login",  to: "sessions#login"
        post "verify", to: "sessions#verify"
        get "me", to: "sessions#me"
      end
    end
  end


end
