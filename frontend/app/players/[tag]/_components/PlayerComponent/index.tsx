"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Searching from "@/app/_components/Searching";
import { appendToEightDigits, shortenPlayerName } from "@/app/_lib/common";
import styles from "./index.module.scss";

const PlayerComponent = ({
  player,
  starPlayerTag,
  battleType,
  isDuel,
  isMe,
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

  return (
    <Link
      key={player?.tag}
      href={href}
      className={styles.playerContainer}
      data-testid="playerComponent"
      onClick={() => {
        setLoading(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("last_source", "battle_history");
        }
      }}
    >
      {isStarPlayer && <div className={styles.mvpContainer}>STAR PLAYER</div>}
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
        />
        {battleType === "ranked" && (
          <div className={styles.trophiesContainer}>
            <Image
              src={"/icon_trophy1.png"}
              alt="trophy icon"
              width={8}
              height={8}
              style={{ transform: `rotate(7deg)` }}
            />
            {player?.brawler?.trophies}
          </div>
        )}
        {battleType === "soloRanked" && (
          <div className={styles.rank}>
            <Image
              src={`https://cdn.brawlify.com/ranked/tiered/${appendToEightDigits(58000000, player?.brawler?.trophies > 0 ? player?.brawler?.trophies - 1 : 0)}.png`}
              alt="rank"
              height={20}
              width={20}
              style={{ height: "20px", width: "auto" }}
            />
          </div>
        )}
        {(battleType === "ranked" || battleType === "soloRanked") && (
          <div className={styles.levelContainer}>
            <strong>LVL</strong>
            <h6>{player?.brawler?.power}</h6>
          </div>
        )}
      </div>
      {shortenedName}
    </Link>
  );
};
export default PlayerComponent;
