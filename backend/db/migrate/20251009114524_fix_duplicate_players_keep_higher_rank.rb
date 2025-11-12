class FixDuplicatePlayersKeepHigherRank < ActiveRecord::Migration[8.0]
  def up
    # バックアップテーブルを作成（削除されるデータ用）
    execute <<~SQL
      CREATE TABLE IF NOT EXISTS duplicate_players_backup AS
      SELECT p1.*
      FROM players p1
      INNER JOIN players p2 ON p1.name = p2.name#{' '}
        AND p1.club_name = p2.club_name#{' '}
        AND p1.id != p2.id
      WHERE (
        p1.rank < p2.rank
        OR (p1.rank = p2.rank AND p1.id < p2.id)
      );
    SQL

    # 削除前にログ出力用のデータ取得
    duplicates = execute <<~SQL
      SELECT p1.id, p1.tag, p1.name, p1.rank, p1.club_name,
             p2.id as kept_id, p2.tag as kept_tag, p2.rank as kept_rank
      FROM players p1
      INNER JOIN players p2 ON p1.name = p2.name#{' '}
        AND p1.club_name = p2.club_name#{' '}
        AND p1.id != p2.id
      WHERE (
        p1.rank < p2.rank
        OR (p1.rank = p2.rank AND p1.id < p2.id)
      );
    SQL

    puts "Deleting #{duplicates.count} duplicate players with lower ranks:"
    duplicates.each do |row|
      puts "  Deleting: ID=#{row['id']}, Tag=#{row['tag']}, Rank=#{row['rank']}"
      puts "  Keeping:  ID=#{row['kept_id']}, Tag=#{row['kept_tag']}, Rank=#{row['kept_rank']}"
      puts "  ---"
    end

    # rankが低い重複プレイヤーを削除
    execute <<~SQL
      DELETE FROM players p1
      USING players p2
      WHERE p1.name = p2.name
        AND p1.club_name = p2.club_name
        AND p1.id != p2.id
        AND (
          p1.rank < p2.rank
          OR (p1.rank = p2.rank AND p1.id < p2.id)
        );
    SQL

    puts "Duplicate player cleanup completed."
  end

  def down
    # バックアップから復元
    execute <<~SQL
      INSERT INTO players (tag, name, icon_id, club_name, rank, trophies, approved_reports_count, created_at, updated_at)
      SELECT tag, name, icon_id, club_name, rank, trophies, approved_reports_count, created_at, updated_at
      FROM duplicate_players_backup
      ON CONFLICT (tag) DO NOTHING;
    SQL

    # バックアップテーブルを削除
    execute "DROP TABLE IF EXISTS duplicate_players_backup;"

    puts "Restored duplicate players from backup."
  end
end
