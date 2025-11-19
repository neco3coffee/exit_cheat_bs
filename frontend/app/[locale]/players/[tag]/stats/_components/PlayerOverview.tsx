import Image from "next/image";
import { appendToEightDigits } from "@/app/_lib/common";
import styles from "./PlayerOverview.module.scss";

type PlayerOverviewStats = {
  battleCount: {
    label: string;
    value: string;
  };
  winRate: {
    label: string;
    value: string;
    percentage: number;
  };
  highestRank: {
    rank: number | null | undefined;
    alt: string;
  };
};

type PlayerOverviewProps = {
  player: {
    name: string;
    tag: string;
    iconId: number;
    nameColor?: string;
  };
  subtitle?: string;
  stats?: PlayerOverviewStats;
};

export function PlayerOverview({
  player,
  subtitle,
  stats,
}: PlayerOverviewProps) {
  const normalizedTag = player.tag.replace(/^#?/, "").toUpperCase();
  const nameColorHex = player.nameColor
    ? `#${player.nameColor.replace(/^0x/, "").slice(2)}`
    : "#ffffff";
  const highestRankValue = stats?.highestRank?.rank ?? null;
  const hasHighestRank =
    typeof highestRankValue === "number" && highestRankValue > 0;
  const highestRankSpriteId = hasHighestRank
    ? appendToEightDigits(58000000, Math.max((highestRankValue ?? 1) - 1, 0))
    : null;
  const winRatePercentage = stats?.winRate?.percentage ?? null;
  const winRateClassName = [
    styles.metricValue,
    winRatePercentage === null
      ? ""
      : winRatePercentage >= 60
        ? styles.metricValueVictory
        : winRatePercentage < 50
          ? styles.metricValueDefeat
          : styles.metricValueNeutral,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.container}>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      <div className={styles.content}>
        <div className={styles.avatarBlock}>
          <div className={styles.avatarWrapper}>
            <Image
              src={`https://cdn.brawlify.com/profile-icons/regular/${player.iconId}.png`}
              alt={player.name}
              width={75}
              height={75}
              sizes="75px"
            />
          </div>
          <span className={styles.tag}>#{normalizedTag}</span>
        </div>
        <div className={styles.meta}>
          <h1 className={styles.name} style={{ color: nameColorHex }}>
            {player.name}
          </h1>
          <div className={styles.detailsRow}>
            <div className={styles.rankBadge}>
              {highestRankSpriteId ? (
                <Image
                  src={`https://cdn.brawlify.com/ranked/tiered/${highestRankSpriteId}.png`}
                  alt={stats?.highestRank.alt ?? ""}
                  width={50}
                  height={50}
                  sizes="50px"
                />
              ) : (
                <span className={styles.rankFallback}>
                  {stats?.highestRank.alt ?? ""}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={styles.stats}>
          {stats ? (
            <div className={styles.metrics}>
              <div className={styles.metric}>
                <span aria-hidden className={styles.metricEmoji}>
                  ⚔️
                </span>
                <span className="sr-only">{stats.battleCount.label}</span>
                <span className={styles.metricValue}>
                  {stats.battleCount.value}
                </span>
              </div>
              <div className={styles.metric}>
                <span aria-hidden className={styles.metricEmoji}>
                  🏆
                </span>
                <span className="sr-only">{stats.winRate.label}</span>
                <span className={winRateClassName}>{stats.winRate.value}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
