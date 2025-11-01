import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { appendToEightDigits, shortenPlayerName } from "@/app/_lib/common";
import styles from "./index.module.scss";

export default async function PlayerComponent({
  locale,
  player,
  starPlayerTag,
  isDuel,
  reportedPlayerTag,
}: any) {
  const shortenedName = shortenPlayerName(player?.name);
  const isStarPlayer = player?.tag === starPlayerTag;
  const hashRemovedPlayerTag = player?.tag?.startsWith("#")
    ? player?.tag.slice(1)
    : player?.tag;

  // Tags with less than 4 characters are bots, so link to home
  const isBot = hashRemovedPlayerTag && hashRemovedPlayerTag.length < 4;
  const href = isBot
    ? `/${locale}`
    : `/${locale}/players/${hashRemovedPlayerTag}`;

  const _t = await getTranslations({ locale, namespace: "ranked" });

  return (
    <Link
      key={player?.tag}
      href={href}
      className={styles.playerContainer}
      data-testid="playerComponent"
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
      <span>{shortenedName}</span>
    </Link>
  );
}
