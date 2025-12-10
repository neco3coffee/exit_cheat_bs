class SavePlayerJob < ApplicationJob
  queue_as :default

  def perform(player_tag)

    # 既にDBに存在するかチェック
    existing_player = Player.find_by(tag: player_tag)
    if existing_player
      return
    end

    # 外部APIからプレイヤー情報を取得して保存
    fetcher = PlayerFetcher.new
    player_data = fetcher.fetch_player(player_tag)

    if player_data
      # バトルログも取得してランク計算のために渡す
      battlelog_data = fetcher.fetch_battlelog(player_tag)
      player = fetcher.save_or_update_player(player_data, battlelog_data)
    else
    end

  rescue StandardError => e
    raise e
  end
end
