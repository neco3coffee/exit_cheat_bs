"use client";

import { Activity } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { report } from "process";
import { appendToEightDigits } from "@/app/_lib/common";
import { RelativeTime } from "@/app/_lib/time";
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
          const isActive = reportedPlayer.lastActiveAt
            ? reportedPlayer.lastActiveAt >=
              new Date(Date.now() - 35 * 60 * 1000).toISOString()
            : false;
          var tag = reportedPlayer.tag.startsWith("#")
            ? reportedPlayer.tag.substring(1)
            : reportedPlayer.tag;
          tag = tag.toUpperCase();
          tag = tag.replace(/O/g, "0");

          const isNameLong = reportedPlayer.name.length > 6;

          return (
            <Link
              className={styles.card}
              key={reportedPlayer.tag}
              href={`/${locale}/players/${encodeURIComponent(tag)}`}
            >
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
                    smallName={isNameLong}
                  />
                </div>
                <div className={styles.lastActiveAt}>
                  {reportedPlayer.lastActiveAt && isActive ? (
                    <>
                      <Image
                        src="/icon_ranked_front 1.png"
                        alt="Logo"
                        width={25}
                        height={26}
                        priority
                        sizes="25px"
                      />
                      <RelativeTime target={reportedPlayer.lastActiveAt} />
                      <Activity
                        className={`h-5.5 w-5.5 ${
                          isActive
                            ? "text-blue-400 animate-pulse"
                            : "text-gray-400 opacity-40"
                        }`}
                      />
                    </>
                  ) : reportedPlayer.lastActiveAt ? (
                    <>
                      <Image
                        src="/icon_ranked_front 1.png"
                        alt="Logo"
                        width={25}
                        height={26}
                        priority
                        sizes="25px"
                      />
                      <RelativeTime target={reportedPlayer.lastActiveAt} />
                      <Activity
                        className={`h-5.5 w-5.5 ${
                          isActive
                            ? "text-blue-400 animate-pulse"
                            : "text-gray-400 opacity-40"
                        }`}
                      />
                    </>
                  ) : (
                    <>
                      <Image
                        src="/icon_ranked_front 1.png"
                        alt="Logo"
                        width={25}
                        height={26}
                        priority
                        sizes="25px"
                      />
                      <Activity
                        className={`h-5.5 w-5.5 ${
                          isActive
                            ? "text-blue-400 animate-pulse"
                            : "text-gray-400 opacity-40"
                        }`}
                      />
                    </>
                  )}
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
            </Link>
          );
        })
      )}
    </div>
  );
}
