"use client";

import Image from "next/image";
import { appendToEightDigits } from "@/app/_lib/common";
import PlayerName from "@/app/[locale]/players/[tag]/_components/PlayerName";
import styles from "./index.module.scss";
import type { ReportedPlayer } from "./types";

type ReportedPlayersListProps = {
  locale: string;
  players: ReportedPlayer[];
  emptyMessage?: string;
};

function formatReportedAt(locale: string, reportedAt: string) {
  const date = new Date(reportedAt);
  if (Number.isNaN(date.getTime())) {
    return reportedAt;
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    return date.toISOString();
  }
}

export default function ReportedPlayersList({
  locale,
  players,
  emptyMessage,
}: ReportedPlayersListProps) {
  const hasPlayers = Array.isArray(players) && players.length > 0;

  return (
    <div className={styles.container}>
      {!hasPlayers ? (
        <h5 className={styles.emptyMessage}>
          {emptyMessage ?? "No reported players"}
        </h5>
      ) : (
        players.map((reportedPlayer) => {
          const iconId = reportedPlayer.icon_id?.toString();
          const rankNumber =
            typeof reportedPlayer.rank === "number"
              ? reportedPlayer.rank
              : Number.parseInt(String(reportedPlayer.rank ?? 0), 10);
          const hasRank = Number.isFinite(rankNumber) && rankNumber > 0;
          const rankImageId = appendToEightDigits(
            58000000,
            hasRank ? Math.max(rankNumber - 1, 0) : 0,
          );
          const formattedReportedAt = formatReportedAt(
            locale,
            reportedPlayer.reportedAt,
          );

          return (
            <div className={styles.card} key={reportedPlayer.tag}>
              <div className={styles.topRow}>
                <div className={styles.avatar}>
                  {iconId ? (
                    <Image
                      src={`https://cdn.brawlify.com/profile-icons/regular/${iconId}.png`}
                      alt={`${reportedPlayer.name} icon`}
                      width={48}
                      height={48}
                      sizes="48px"
                    />
                  ) : (
                    <div className={styles.avatarFallback}>?</div>
                  )}
                </div>
                <div className={styles.nameWrapper}>
                  <PlayerName
                    name={reportedPlayer.name}
                    nameColor={null}
                    nameHistories={reportedPlayer.nameHistories}
                  />
                </div>
              </div>
              <div className={styles.bottomRow}>
                <span className={styles.tag}>{reportedPlayer.tag}</span>
                <div className={styles.rank}>
                  {hasRank ? (
                    <Image
                      src={`https://cdn.brawlify.com/ranked/tiered/${rankImageId}.png`}
                      alt={`Rank ${rankNumber}`}
                      width={32}
                      height={32}
                      sizes="32px"
                    />
                  ) : (
                    <span className={styles.rankFallback}>-</span>
                  )}
                </div>
                <time
                  className={styles.reportedAt}
                  dateTime={reportedPlayer.reportedAt}
                >
                  {formattedReportedAt}
                </time>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
