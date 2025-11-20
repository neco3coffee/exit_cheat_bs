# frozen_string_literal: true

class SeasonCalendar
  TIME_ZONE = ActiveSupport::TimeZone["Asia/Tokyo"]
  NTH_OF_MONTH = 3
  START_WEEKDAY = 4 # Thursday
  END_WEEKDAY = 3   # Wednesday
  TRANSITION_HOUR = 17

  class << self
    def current_period(reference_time = Time.zone.now)
      new(reference_time).current_period
    end

    def current_period_in_utc(reference_time = Time.zone.now)
      start_time, end_time, next_start_time = current_period(reference_time)
      [ start_time.utc, end_time.utc, next_start_time.utc ]
    end
  end

  def initialize(reference_time)
    @reference_time = reference_time.in_time_zone(TIME_ZONE)
  end

  def current_period
    start_time = season_start_for(@reference_time.year, @reference_time.month)

    if @reference_time < start_time
      previous = @reference_time.advance(months: -1)
      start_time = season_start_for(previous.year, previous.month)
    end

    loop do
      end_time = season_end_for(start_time.year, start_time.month)
      next_month = start_time.advance(months: 1)
      next_start_time = season_start_for(next_month.year, next_month.month)

      return [ start_time, end_time, next_start_time ] if @reference_time < next_start_time

      start_time = next_start_time
    end
  end

  private

  def season_start_for(year, month)
    date = nth_weekday_of_month(year, month, START_WEEKDAY)
    TIME_ZONE.local(date.year, date.month, date.day, TRANSITION_HOUR, 0, 0)
  end

  def season_end_for(year, month)
    base = Date.new(year, month, 1).next_month
    date = nth_weekday_of_date(base, END_WEEKDAY)
    TIME_ZONE.local(date.year, date.month, date.day, TRANSITION_HOUR, 0, 0)
  end

  def nth_weekday_of_month(year, month, weekday)
    base = Date.new(year, month, 1)
    nth_weekday_of_date(base, weekday)
  end

  def nth_weekday_of_date(base_date, weekday)
    offset = (weekday - base_date.wday) % 7
    (base_date + offset) + 7 * (NTH_OF_MONTH - 1)
  end
end
