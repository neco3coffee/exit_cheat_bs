// @ts-nocheck
import express from "express";
import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events,
} from "discord.js";
import fetch from "node-fetch";

const collectVotes = async () => {
  try {
    const record = votes.get(String(report_id)) || {
      griefer: new Set(),
      normal: new Set(),
    };
    const yesVotes = record.griefer.size;
    const noVotes = record.normal.size;

    if (yesVotes === 0 && noVotes === 0) {
      // 投票がなかった場合は3時間延長
      await channel.send(
        `🕒 投票がありませんでした。投票期間を3時間延長します。（Report #${report_id}）`
      );
      setTimeout(collectVotes, 60 * 60 * 1000 * 3); // 3時間延長
      return;
    }

    const result =
      yesVotes === 0 && noVotes === 0
        ? "no_votes"
        : yesVotes > noVotes
          ? "griefer"
          : noVotes > yesVotes
            ? "normal"
            : "tie";

    const apiUrl = `${SAFE_BRAWL_API_BASE}/reports/${report_id}/voted`;
    console.log(`📡 Rails APIへPOST: ${apiUrl} (${result})`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result }),
    });

    const data = await response.json();
    console.log(`✅ Rails側応答:`, data);

    // Discordに結果を通知
    await channel.send(
      `🕒 投票終了: Report #${report_id}\n結果: **${result === "griefer"
        ? "✅ 利敵・献上"
        : result === "normal"
          ? "❌ 真面目にやってる"
          : result === "tie"
            ? "🤝 引き分け"
            : "🚫 投票なし"
      }**`
    );

    // 投票データ削除
    votes.delete(String(report_id));
  } catch (e) {
    console.error("投票集計エラー:", e);
  }
}


// ===============================
// 設定
// ===============================
const app = express();
app.use(express.json());

const PORT = process.env.BOT_PORT || 4000;
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const SAFE_BRAWL_API_BASE =
  process.env.SAFE_BRAWL_API_URL || "https://safebrawl.com/api/v1";
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const REPORT_TYPE = {
  "badRandom": "エイム力もスキルも協調性もなし",
  "griefPlay": "立ち止まって攻撃しない、チーム妨害、プレイ放棄",
  "cheating": "ハッキング、ボットの使用、システム・不具合の悪用、八百長"
};

// ===============================
// Discordクライアント初期化
// ===============================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

// ✅ 投票データを保持するMap
// key: report_id, value: { griefer: Set<userId>, normal: Set<userId> }
const votes = new Map();

// ===============================
// Discord 接続
// ===============================
client.once("ready", () => {
  console.log(`✅ Logged in as ${client?.user?.tag}`);
});
client.login(TOKEN);

// ===============================
// Rails → Bot 投票メッセージ送信API
// ===============================
app.post("/api/vote_message", async (req, res) => {
  try {
    const { report_id, video_url, reported_tag, battle_data, report_type } = req.body;
    if (!report_id || !video_url) {
      return res
        .status(400)
        .json({ error: "report_id and video_url are required" });
    }

    // @ts-ignore
    const channel = await client.channels.fetch(CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setTitle("🧾 新しい報告が最適化されました")
      .setDescription(
        `**Report ID:** ${report_id}\n` +
        `**報告対象:** ${battle_data.battle.teams.flat().find((p) => p.tag === reported_tag)?.name || '不明な名前' }\n` +
        `**報告タイプ:** ${REPORT_TYPE[report_type]}\n` +
        `▶️ [動画を再生する](${video_url})\n\nこのプレイヤーは利敵行為をしていますか？`
      )
      .setColor(0x5865f2)
      .setFooter({ text: "投票は6時間後に自動集計されます" });

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`vote_griefer_${report_id}`)
        .setLabel("✅ 利敵・献上")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`vote_normal_${report_id}`)
        .setLabel("❌ 真面目にやってる")
        .setStyle(ButtonStyle.Danger)
    );

    if (!channel?.isTextBased()) {
      console.error("指定されたチャンネルはテキストチャンネルではありません");
      return;
    }

    // @ts-ignore
    const message = await channel.send({ embeds: [embed], components: [buttons] });

    console.log(`📨 投票メッセージ送信完了: Report #${report_id}`);

    setTimeout(async () => {
      collectVotes();
    // }, 60 * 1000); // ← テストでは1分
    }, 60 * 60 * 1000 * 6); // ← 本番では6時間

    res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ===============================
// ボタン押下イベント
// ===============================
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const [_, type, reportId] = interaction.customId.split("_");
  const label = type === "griefer" ? "✅ 利敵・献上" : "❌ 真面目にやってる";

  // 投票を記録
  if (!votes.has(reportId)) {
    votes.set(reportId, { griefer: new Set(), normal: new Set() });
  }
  const record = votes.get(reportId);
  record.griefer.delete(interaction.user.id);
  record.normal.delete(interaction.user.id);
  record[type].add(interaction.user.id);

  console.log(
    `[投票記録] Report #${reportId} → griefer:${record.griefer.size} normal:${record.normal.size}`
  );

  // ユーザーへ返信
  await interaction.reply({
    content: `あなたの投票: **${label}** を受け付けました！（Report #${reportId}）`,
    ephemeral: true,
  });
});


// ===============================
// HTTPサーバー起動
// ===============================
app.listen(PORT, () => {
  console.log(`🌐 Bot HTTP server running on port ${PORT}`);
});
