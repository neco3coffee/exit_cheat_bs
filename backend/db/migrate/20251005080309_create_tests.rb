class CreateTests < ActiveRecord::Migration[8.0]
  def up
    # PostgreSQL拡張を有効化
    enable_extension "unaccent"      # アクセント文字の正規化
    enable_extension "pg_trgm"       # トリグラム検索（部分一致・類似度）
    enable_extension "btree_gin"     # GINインデックス用

    # testsテーブルを作成
    create_table :tests do |t|
      # Unicode文字数で15文字制限（絵文字含む）
      t.string :name, limit: 255, null: false

      # 検索用の正規化されたname（小文字、アクセント除去）
      t.string :normalized_name, limit: 255

      t.timestamps
    end

    # 制約とインデックスを追加
    add_check_constraint :tests, "char_length(name) <= 15", name: "check_name_length"
    add_index :tests, :name

    # シンプルな部分一致検索用のインデックス（ILIKEで使用）
    add_index :tests, :normalized_name
    add_index :tests, "lower(name)", name: "index_tests_name_lower"
  end

  def down
    drop_table :tests

    disable_extension "unaccent"
    disable_extension "pg_trgm"
    disable_extension "btree_gin"
  end
end
