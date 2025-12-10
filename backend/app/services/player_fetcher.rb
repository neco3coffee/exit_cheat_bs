require "faraday"
require "json"
require "uri"
require "set"

class PlayerFetcher
  BASE_URL = "https://api.brawlstars.com/v1"

  def initialize(api_token = ENV["BRAWL_STARS_API_TOKEN1"])
    @api_token = api_token
  end

  # プレイヤー情報を外部APIから取得
  def fetch_player(tag)
    normalized_tag = normalize_tag(tag)
    url = "#{BASE_URL}/players/#{URI.encode_www_form_component(normalized_tag)}"


    response = Faraday.get(url) do |req|
      req.headers["Authorization"] = "Bearer #{@api_token}"
      req.headers["Accept"] = "application/json"
    end

    if response.status == 200
      JSON.parse(response.body)
    else
      nil
    end
  end

  # プレイヤーのバトルログを外部APIから取得
  def fetch_battlelog(tag)
    normalized_tag = normalize_tag(tag)
    url = "#{BASE_URL}/players/#{URI.encode_www_form_component(normalized_tag)}/battlelog"

    response = Faraday.get(url) do |req|
      req.headers["Authorization"] = "Bearer #{@api_token}"
      req.headers["Accept"] = "application/json"
    end

    if response.status == 200
      JSON.parse(response.body)
    else
      nil
    end
  end

  # クラブ情報を外部APIから取得
  def fetch_club(club_tag)
    normalized_tag = normalize_tag(club_tag)
    url = "#{BASE_URL}/clubs/#{URI.encode_www_form_component(normalized_tag)}"

    response = Faraday.get(url) do |req|
      req.headers["Authorization"] = "Bearer #{@api_token}"
      req.headers["Accept"] = "application/json"
    end

    if response.status == 200
      JSON.parse(response.body)
    else
      nil
    end
  end

  # プレイヤー情報をDBに保存または更新
  def save_or_update_player(player_data, battlelog_data = nil)
    return nil unless player_data

    tag = normalize_tag(player_data["tag"])

    # バトルログからランクを計算
    rank = 0
    if battlelog_data
      rank = calculate_latest_solo_ranked_trophies(battlelog_data, player_data["tag"])
    end

    player_attrs = {
      tag: tag,
      name: player_data["name"],
      icon_id: player_data.dig("icon", "id"),
      club_name: player_data.dig("club", "name"),
      trophies: player_data["trophies"] || 0
    }

    # rankがnilでない場合のみ更新対象に含める
    player_attrs[:rank] = rank unless rank.nil?

    player = Player.find_by(tag: tag)

    if player

      # 名前が変更されているかチェック
      if player.name != player_attrs[:name]
        # 履歴を保存
        save_name_history(player, player.name, player.icon_id)
      end

      player.update!(player_attrs)
    else
      player = Player.create!(player_attrs)
    end

    player
  end

  # 直近のバトルログから他のプレイヤーのタグを抽出（最新3件のバトルから）
  def extract_player_tags_from_recent_battles(battlelog_data, limit = 3)
    return [] unless battlelog_data && battlelog_data["items"]

    player_tags = Set.new

    recent_items = battlelog_data["items"].take(limit)
    recent_items.each do |item|
      battle = item["battle"]
      next unless battle && battle["teams"]

      battle["teams"].each do |team|
        team.each do |player|
          tag = player["tag"]
          next unless tag

          normalized_tag = normalize_tag(tag)
          player_tags << normalized_tag
        end
      end
    end

    player_tags.to_a
  end

  private

  def normalize_tag(tag)
    return "" unless tag.present?

    tag = tag.to_s.upcase.strip
    tag = tag.gsub("O", "0")
    tag = "##{tag}" unless tag.start_with?("#")
    tag
  end

  def calculate_latest_solo_ranked_trophies(data, player_tag)
    return nil unless data && data["items"]

    # プレイヤータグを正規化（#を付与し、大文字に変換）
    normalized_player_tag = normalize_tag(player_tag)

    # バトル履歴を時系列順で確認（最新から）
    data["items"].each do |item|
      battle = item["battle"]
      # soloRankedタイプのバトルのみを対象とする
      next unless battle && battle["type"] == "soloRanked"


      # チーム内の全プレイヤーを確認
      battle["teams"].each do |team|
        team.each do |player|
          player_tag_in_battle = normalize_tag(player["tag"])


          # タグが一致した場合、そのプレイヤーのブローラーのトロフィー数を返す
          if player_tag_in_battle == normalized_player_tag
            brawler_trophies = player.dig("brawler", "trophies")
            return brawler_trophies
          end
        end
      end
    end

    nil # 見つからなかった場合
  end

  private

  # 名前変更履歴を保存
  def save_name_history(player, old_name, old_icon_id)
    player.player_name_histories.create!(
      name: old_name,
      icon_id: old_icon_id,
      changed_at: Time.current
    )
  end
end
