import Image from "next/image";
import { appendToEightDigits } from "@/app/_lib/common";
import styles from "./PlayerOverview.module.scss";

type PlayerOverviewProps = {
  player: {
    name: string;
    tag: string;
    iconId: number;
    nameColor?: string;
    currentRank?: number;
  };
  subtitle?: string;
};

export function PlayerOverview({ player, subtitle }: PlayerOverviewProps) {
  const normalizedTag = player.tag.replace(/^#?/, "").toUpperCase();
  const nameColorHex = player.nameColor
    ? `#${player.nameColor.replace(/^0x/, "").slice(2)}`
    : "#ffffff";
  const hasRank =
    typeof player.currentRank === "number" && player.currentRank > 0;
  const rankSpriteId = hasRank
    ? appendToEightDigits(58000000, Math.max((player.currentRank ?? 1) - 1, 0))
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.avatarWrapper}>
        <Image
          src={`https://cdn.brawlify.com/profile-icons/regular/${player.iconId}.png`}
          alt={player.name}
          width={96}
          height={96}
          sizes="96px"
        />
      </div>
      <div className={styles.meta}>
        <span className={styles.tag}>#{normalizedTag}</span>
        <h1 className={styles.name} style={{ color: nameColorHex }}>
          {player.name}
        </h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {hasRank && rankSpriteId ? (
        <div className={styles.rankBadge}>
          <Image
            src={`https://cdn.brawlify.com/ranked/tiered/${rankSpriteId}.png`}
            alt={`Rank ${player.currentRank}`}
            width={90}
            height={90}
            sizes="90px"
          />
        </div>
      ) : null}
    </div>
  );
}
