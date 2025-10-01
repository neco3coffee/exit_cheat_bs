"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Searching from "@/app/_components/Searching";
import {
  appendToEightDigits,
  shortenPlayerName,
} from "@/app/players/[tag]/_lib/common";
import styles from "./index.module.scss";

const PlayerComponent = (
  player: any,
  starPlayerTag: string | null,
  battleType: string,
  isDuel?: boolean,
) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const shortenedName = shortenPlayerName(player?.name);
  const isStarPlayer = player?.tag === starPlayerTag;
  const hashRemovedPlayerTag = player?.tag?.startsWith("#")
    ? player?.tag.slice(1)
    : player?.tag;

  // Tags with less than 4 characters are bots, so link to home
  const isBot = hashRemovedPlayerTag && hashRemovedPlayerTag.length < 4;
  const href = isBot ? "/" : `/players/${hashRemovedPlayerTag}`;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setLoading(true);
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setLoading(true);
      router.push(href);
    }
  };

  return (
    <div
      key={player?.tag}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className={styles.playerContainer}
    >
      {isStarPlayer && <div className={styles.mvpContainer}>MVP</div>}
      <div className={styles.brawlerContainer}>
        {loading ? (
          <div className={styles.searchingContainer}>
            <Searching loading={loading} compact={true} />
          </div>
        ) : (
          <Image
            src={`https://cdn.brawlify.com/brawlers/borderless/${isDuel ? player?.brawlers[0].id : player?.brawler?.id}.png`}
            alt={isDuel ? player?.brawlers[0].name : player?.brawler?.name}
            fill={true}
          />
        )}
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
              src={`https://cdn.brawlify.com/ranked/tiered/${appendToEightDigits(58000000, player?.brawler?.trophies)}.png`}
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
    </div>
  );
};
export default PlayerComponent;
