class PointGrantService
  DAILY_AUTO_BATTLE_LIMIT = 3
  DEFAULT_POINT = 1
  REPORT_APPROVED_POINT = 5

  def initialize(player)
    @player = player
  end

  def grant_daily_login
    if @player.point_events.where(reason: :daily_login).exists?
      grant_once_daily(
        reason: :daily_login,
        title_key: "daily_login"
      )
    else
      grant_once_daily(
        reason: :daily_login,
        title_key: "first_login",
        point: 100
      )
    end
  end

  def grant_first_report(report)
    grant_once_daily(
      reason: :first_report,
      related: report,
      title_key: "first_report_bonus"
    )
  end

  def grant_report_approved(report)
    # No daily limit, just grant points
    ActiveRecord::Base.transaction do
      @player.lock!

      create_event_and_increment!(
        reason: :report_approved,
        related: report,
        granted_on: Date.current,
        point: REPORT_APPROVED_POINT
      )

      {
        granted: true,
        title: "report_approved_bonus",
        point: REPORT_APPROVED_POINT,
        total_point: @player.total_points
      }
    end
  end

  def grant_auto_battle(battle)
    today = Date.current

    # Check count first to avoid unnecessary transaction
    current_count = @player.point_events
                           .where(reason: :auto_battle, granted_on: today)
                           .count

    if current_count >= DAILY_AUTO_BATTLE_LIMIT
      return {
        granted: false,
        total_point: @player.total_points,
        remaining: 0
      }
    end

    ActiveRecord::Base.transaction do
      # Lock player to prevent race conditions on total_points
      @player.lock!

      # Double check count inside lock/transaction
      current_count_in_tx = @player.point_events
                                   .where(reason: :auto_battle, granted_on: today)
                                   .count

      if current_count_in_tx >= DAILY_AUTO_BATTLE_LIMIT
        return {
          granted: false,
          total_point: @player.total_points,
          remaining: 0
        }
      end

      create_event_and_increment!(
        reason: :auto_battle,
        related: battle,
        granted_on: today
      )

      {
        granted: true,
        title: "auto_battle_bonus",
        point: DEFAULT_POINT,
        total_point: @player.total_points,
        remaining: DAILY_AUTO_BATTLE_LIMIT - (current_count_in_tx + 1)
      }
    end
  rescue ActiveRecord::RecordNotUnique
    # Should not happen for auto_battle with the new index, but good to keep for safety
    today = Date.current
    {
      granted: false,
      total_point: @player.reload.total_points,
      remaining: [ 0, DAILY_AUTO_BATTLE_LIMIT - (@player.point_events.where(reason: :auto_battle, granted_on: today).count) ].max
    }
  end

  private

  def grant_once_daily(reason:, title_key:, related: nil, point: DEFAULT_POINT)
    today = Date.current

    # Quick check before transaction
    if @player.point_events.exists?(reason: reason, granted_on: today)
      return { granted: false, total_point: @player.total_points }
    end

    ActiveRecord::Base.transaction do
      @player.lock!

      # Double check inside lock
      if @player.point_events.exists?(reason: reason, granted_on: today)
        return { granted: false, total_point: @player.total_points }
      end

      create_event_and_increment!(
        reason: reason,
        related: related,
        granted_on: today,
        point: point
      )

      {
        granted: true,
        title: title_key,
        point: point,
        total_point: @player.total_points
      }
    end
  rescue ActiveRecord::RecordNotUnique
    { granted: false, total_point: @player.reload.total_points }
  end

  def create_event_and_increment!(reason:, related:, granted_on:, point: DEFAULT_POINT)
    @player.point_events.create!(
      point: point,
      reason: reason,
      granted_on: granted_on,
      related: related,
      displayed: false
    )
    @player.increment!(:total_points, point)
  end
end
