FactoryBot.define do
  factory :player do
    sequence(:tag) { |n| "#PLAYER#{n}" }
    sequence(:name) { |n| "Player#{n}" }
    icon_id { 1 }
    trophies { 1000 }
    rank { 10 }
    club_name { "Test Club" }
    approved_reports_count { 0 }
    created_at { Time.current }
    updated_at { Time.current }
  end
end
