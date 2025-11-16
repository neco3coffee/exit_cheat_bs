FactoryBot.define do
  factory :battle do
    association :player
    rank { 10 }
    sequence(:battle_id) { |n| "2025-11-15T12:00:00Z-#PLAYER#{n}-#ALLY#{n}-#ENEMY#{n}" }
    battle_time { Time.zone.parse("2025-11-15 12:00:00 UTC") }
    mode { "bounty" }
    type { "soloRanked" }
    result { "victory" }
    map { "Excel" }
    map_id { 15000007 }
    teams { [] }
    rounds { [] }
    raw_data { {} }
  end
end
