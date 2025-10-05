require 'rails_helper'
require 'benchmark'

RSpec.describe Test, type: :model do
  describe '.search method simple testing' do
    before(:all) do
      # テストデータ作成（全テストで共有）
      Test.delete_all

      # 基本検索用データ
      create_list(:test, 6, :exact_match)

      # 部分一致検索用データ
      create_list(:test, 8, :partial_match)

      # 多言語・特殊文字データ
      create_list(:test, 10, :multilingual)

      # エッジケースデータ
      create_list(:test, 8, :edge_cases)
    end

    after(:all) do
      Test.delete_all
    end

    describe '🔍 基本的な部分一致検索' do
      it '英語部分一致で関連する結果を返す' do
        results = Test.search("Player")
        found_names = results.pluck(:name)
        expect(found_names).to include("PlayerMaster", "SuperPlayer", "🎮Player🎮")
      end

      it '日本語部分一致で関連する結果を返す' do
        results = Test.search("プレイヤー")
        expect(results.pluck(:name)).to include("最強プレイヤー")
      end

      it '大小文字を区別せずに検索する' do
        results = Test.search("player")
        found_names = results.pluck(:name)
        expect(found_names).to include("PlayerMaster", "SuperPlayer")
      end

      it '数字を含む名前で部分一致する' do
        results = Test.search("123")
        expect(results.pluck(:name)).to include("Player123")
      end
    end

    describe '🎯 完全一致検索' do
      it '完全一致する名前を返す' do
        results = Test.search("José")
        expect(results.pluck(:name)).to include("José")
      end

      it '絵文字付きの名前で完全一致する' do
        results = Test.search("🎮Player🎮")
        expect(results.pluck(:name)).to include("🎮Player🎮")
      end
    end

    describe '🌍 多言語・特殊文字検索' do
      it '日本語文字を含む名前を検索する' do
        results = Test.search("田中")
        expect(results.pluck(:name)).to include("🇯🇵田中太郎")
      end

      it '韓国語文字を含む名前を検索する' do
        results = Test.search("박")
        expect(results.pluck(:name)).to include("박지민")
      end

      it '特殊文字を含む名前を検索する' do
        results = Test.search("José")
        expect(results.pluck(:name)).to include("José")
      end
    end

    describe '🎨 絵文字を含む検索' do
      it '絵文字で部分一致検索を行う' do
        results = Test.search("🔥")
        expect(results.pluck(:name)).to include("🔥FireKing🔥")
      end

      it '絵文字混在での部分一致検索を行う' do
        results = Test.search("Fire")
        expect(results.pluck(:name)).to include("🔥FireKing🔥")
      end

      it '絵文字囲み部分一致検索を行う' do
        results = Test.search("Thunder")
        expect(results.pluck(:name)).to include("⚡Thunder⚡")
      end
    end

    describe '⚠️ エッジケース検索' do
      it '1文字検索を処理する' do
        results = Test.search("A")
        expect(results.pluck(:name)).to include("A")
      end

      it '数字のみの検索を処理する' do
        results = Test.search("123")
        expect(results.pluck(:name)).to include("123456")
      end

      it '記号を含む名前を検索する' do
        results = Test.search("CLAN")
        expect(results.pluck(:name)).to include("[CLAN]Boss")
      end

      it 'ハイフンを含む名前を検索する' do
        results = Test.search("Pro-Gamer")
        expect(results.pluck(:name)).to include("Pro-Gamer")
      end

      it '大小文字混在の名前を検索する' do
        results = Test.search("player")
        expect(results.pluck(:name)).to include("pLaYeR")
      end

      it '空文字列での検索は全件返す' do
        results = Test.search("")
        expect(results.count).to be > 0
      end

      it '存在しない名前での検索は空の結果を返す' do
        results = Test.search("NotExistingName123456")
        expect(results).to be_empty
      end
    end
  end

  describe '⚡ パフォーマンステスト' do
    before(:all) do
      # パフォーマンステスト用のより多くのデータを作成
      Test.delete_all
      create_list(:test, 100, :partial_match)
    end

    after(:all) do
      Test.delete_all
    end

    performance_test_cases = [
      { query: "Player", type: "部分一致", max_time: 50 },
      { query: "ゲーマー", type: "日本語", max_time: 50 },
      { query: "🎮", type: "絵文字", max_time: 50 },
      { query: "NonExistent", type: "存在しない", max_time: 50 }
    ]

    performance_test_cases.each do |test_case|
      it "#{test_case[:type]}検索「#{test_case[:query]}」が#{test_case[:max_time]}ms以内に完了する" do
        # ウォームアップ
        Test.search(test_case[:query]).to_a

        time = Benchmark.realtime do
          Test.search(test_case[:query]).to_a
        end

        time_ms = time * 1000
        expect(time_ms).to be < test_case[:max_time],
               "検索に#{time_ms.round(2)}msかかりました（上限: #{test_case[:max_time]}ms）"
      end
    end

    it '平均検索時間が20ms以下である' do
      queries = ["Player", "Gamer", "Master", "NonExistent"]
      times = []

      # 各クエリを5回実行して平均を取る
      queries.each do |query|
        5.times do
          time = Benchmark.realtime do
            Test.search(query).to_a
          end
          times << time * 1000
        end
      end

      average_time = times.sum / times.size
      expect(average_time).to be < 20,
             "平均検索時間が#{average_time.round(2)}msでした（上限: 20ms）"
    end
  end

  describe '🔬 検索結果の検証' do
    before do
      Test.delete_all
      create(:test, name: "Player123")
      create(:test, name: "PlayerMaster")
      create(:test, name: "SuperPlayer")
      create(:test, name: "GamerPro")
    end

    context '部分一致検索の動作確認' do
      it '検索語を含む全ての結果を返す' do
        results = Test.search("Player")

        expect(results.count).to eq(3)
        expect(results.pluck(:name)).to include("Player123", "PlayerMaster", "SuperPlayer")
      end

      it '検索語にマッチしない場合は空の結果を返す' do
        results = Test.search("NotFound")
        expect(results).to be_empty
      end

      it '大小文字を区別せずに検索する' do
        results = Test.search("PLAYER")
        expect(results.count).to eq(3)
      end
    end
  end

  describe '📊 検索結果の統計' do
    before do
      Test.delete_all
      # テストデータを作成
      20.times { |i| create(:test, name: "Player#{i}") }
      10.times { |i| create(:test, name: "Gamer#{i}") }
      5.times { |i| create(:test, name: "Master#{i}") }
    end

    it '部分一致検索で適切な件数の結果を返す' do
      results = Test.search("Player")
      expect(results.count).to eq(20)
    end

    it '別の部分一致検索で適切な件数の結果を返す' do
      results = Test.search("Gamer")
      expect(results.count).to eq(10)
    end

    it '存在しない検索語で0件を返す' do
      results = Test.search("NonExistentTerm")
      expect(results.count).to eq(0)
    end
  end
end
