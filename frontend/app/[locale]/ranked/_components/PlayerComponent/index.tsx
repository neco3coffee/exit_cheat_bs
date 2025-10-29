"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Searching from "@/app/_components/Searching";
import { appendToEightDigits, shortenPlayerName } from "@/app/_lib/common";
import { Link } from "@/app/_messages/i18n/navigation";
import { ReportStatus } from "../BattleLogSoloRanked";
import styles from "./index.module.scss";

const PlayerComponent = ({
  player,
  starPlayerTag,
  battleType,
  isDuel,
  isMe,
  status,
  setStatus,
  setReportedPlayerTag,
  setDialogOpen,
  reportedPlayerTag,
}: any) => {
  const shortenedName = shortenPlayerName(player?.name);
  const isStarPlayer = player?.tag === starPlayerTag;
  const hashRemovedPlayerTag = player?.tag?.startsWith("#")
    ? player?.tag.slice(1)
    : player?.tag;
  const [loading, setLoading] = useState(false);

  // Tags with less than 4 characters are bots, so link to home
  const isBot = hashRemovedPlayerTag && hashRemovedPlayerTag.length < 4;
  const href = isBot ? "/" : `/players/${hashRemovedPlayerTag}`;

  const t = useTranslations("ranked");

  return (
    <Link
      key={player?.tag}
      href={href}
      className={styles.playerContainer}
      data-testid="playerComponent"
      onClick={(e) => {
        if (status === ReportStatus.reportClicked) {
          e.preventDefault();
          return;
        }
        setLoading(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("last_source", "battle_history");
        }
      }}
    >
      {reportedPlayerTag === player?.tag && (
        <Image
          src="/reported_player.png"
          alt="reported player"
          width={24}
          height={24}
          sizes="24px"
          className={styles.reportedIcon}
        />
      )}
      {isStarPlayer && (
        <div className={`${styles.mvpContainer}  `}>STAR PLAYER</div>
      )}
      <div className={styles.brawlerContainer}>
        {!isMe && loading && (
          <div className={styles.searchContainer}>
            <Searching loading={loading} />
          </div>
        )}
        <Image
          src={`https://cdn.brawlify.com/brawlers/borderless/${isDuel ? player?.brawlers[0].id : player?.brawler?.id}.png`}
          alt={
            isDuel
              ? player?.brawlers[0].name
              : player?.brawler?.name || "brawler"
          }
          fill={true}
          sizes="42px"
        />
        <div className={styles.rank}>
          <Image
            src={`https://cdn.brawlify.com/ranked/tiered/${appendToEightDigits(58000000, player?.brawler?.trophies > 0 ? player?.brawler?.trophies - 1 : 0)}.png`}
            alt="rank"
            height={20}
            width={20}
            sizes="20px"
            style={{ height: "20px", width: "auto" }}
          />
        </div>
        <div className={styles.levelContainer}>
          <strong>LVL</strong>
          <h6>{player?.brawler?.power}</h6>
        </div>
      </div>
      {!isMe && status === ReportStatus.reportClicked && (
        <>
          <button
            className={styles.reportButton}
            onClick={(e) => {
              e.preventDefault();
              setStatus(ReportStatus.reportedPlayerClicked);
              setReportedPlayerTag(player?.tag);
              setDialogOpen(true);
            }}
            type="button"
          >
            {t("report")}
          </button>
          <Image
            src="/reported_player.png"
            alt="reported player"
            width={16}
            height={16}
            sizes="16px"
            className={styles.reportIcon}
          />
        </>
      )}
      <span>{shortenedName}</span>
    </Link>
  );
};
export default PlayerComponent;
