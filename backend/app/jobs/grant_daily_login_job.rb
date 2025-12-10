class GrantDailyLoginJob < ApplicationJob
  queue_as :default

  def perform(player_id)
    player = Player.find_by(id: player_id)
    return unless player

    PointGrantService.new(player).grant_daily_login
  end
end
