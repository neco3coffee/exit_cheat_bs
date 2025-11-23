import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { appendToEightDigits } from "@/app/_lib/common";
import styles from "./index.module.scss";

interface SeasonRanking {
  ranking: number;
  tag: string;
  name: string;
  iconId: number;
  rank: number;
  battlesCount: number;
  winRate: number;
}

export default async function SeasonRankingList({
  locale,
  seasonRankings,
}: {
  locale: string;
  seasonRankings: SeasonRanking[];
}) {
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{t("season_ranking_list.title")}</h3>
      <span className={styles.description}>
        {t("season_ranking_list.description")}
      </span>
      <div className={styles.listContainer}>
        {seasonRankings.length === 0 ? (
          <span className={styles.emptyMessage}>
            {t("season_ranking_list.no_data")}
          </span>
        ) : (
          <div className={styles.cardList}>
            {seasonRankings.map((player) => {
              const tag = player.tag.startsWith("#")
                ? player.tag.substring(1)
                : player.tag;
              return (
                <Link
                  key={player.tag}
                  className={styles.playerCard}
                  href={`/${locale}/players/${encodeURIComponent(tag)}/stats`}
                >
                  <div className={styles.rankingBar}>#{player.ranking}</div>
                  <div className={styles.topRow}>
                    <Image
                      src={`https://cdn.brawlify.com/profile-icons/regular/${player.iconId}.png`}
                      alt="icon"
                      width={56}
                      height={56}
                      sizes="56px"
                      className={styles.icon}
                    />
                    <div className={styles.nameBattleCount}>
                      <span className={styles.playerName}>{player.name}</span>
                      <span className={styles.battlesCount}>
                        {player.battlesCount} ⚔️
                      </span>
                    </div>
                  </div>
                  <div className={styles.bottomRow}>
                    <span className={styles.tag}>{player.tag}</span>
                    <span className={styles.playerRank}>
                      <Image
                        src={`https://cdn.brawlify.com/ranked/tiered/${appendToEightDigits(58000000, player.rank - 1)}.png`}
                        alt="rank"
                        height={40}
                        width={40}
                        sizes="40px"
                        style={{ height: "40px", width: "auto" }}
                      />
                    </span>
                    <span
                      className={`${styles.winRate} ${(player.winRate * 100) >= 60 ? styles.winRateGreen : player.winRate * 100 < 40 ? styles.winRateRed : styles.winRateYellow}`}
                    >
                      🏆 {player.winRate * 100}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
