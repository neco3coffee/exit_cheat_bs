FactoryBot.define do
  factory :test do
    # 基本ファクトリー
    name { "Player123" }

    # 各カテゴリー用のファクトリー
    trait :exact_match do
      sequence(:name) do |n|
        [
          "Player123",
          "GAMER_PRO",
          "José",
          "André",
          "ゲーマー太郎",
          "🎮Player🎮"
        ][n % 6]
      end
    end

    trait :partial_match do
      sequence(:name) do |n|
        [
          "PlayerMaster",
          "GamerElite",
          "SuperPlayer",
          "ProGamer123",
          "最強プレイヤー",
          "忍者マスター",
          "🔥FireKing🔥",
          "⚡Thunder⚡"
        ][n % 8]
      end
    end

    trait :multilingual do
      sequence(:name) do |n|
        [
          "María",
          "François",
          "Søren",
          "박지민",
          "李小明",
          "محمد",
          "Владимир",
          "🇯🇵田中太郎",
          "🇺🇸John_US",
          "🇰🇷김민수"
        ][n % 10]
      end
    end

    trait :edge_cases do
      sequence(:name) do |n|
        [
          "A",
          "AI",
          "VeryLongName15",
          "123456",
          "!@#$%",
          "pLaYeR",
          "[CLAN]Boss",
          "Pro-Gamer"
        ][n % 8]
      end
    end
  end
end
