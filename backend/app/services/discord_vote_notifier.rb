require "net/http"
require "uri"
require "json"

class DiscordVoteNotifier
  BOT_URL = ENV.fetch("DISCORD_BOT_URL", "http://bot:4000/api/vote_message")

  def self.notify(report)
    payload = {
      report_id: report.id,
      video_url: report.video_url,
      reported_tag: report.reported_tag,
      battle_data: report.battle_data,
      report_type: report.report_type
    }

    report.status = "waiting_review"
    report.save!

    uri = URI.parse(BOT_URL)
    header = { "Content-Type": "application/json" }

    Net::HTTP.post(uri, payload.to_json, header)
  end
end
