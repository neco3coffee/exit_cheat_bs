import Image from "next/image";
import styles from "./BrawlerStatsSection.module.scss";

type UpgradeGroups = {
  gadgets: number[];
  starPowers: number[];
  gears: number[];
};

type BrawlerStat = UpgradeGroups & {
  id: number;
  name?: string;
  pickRate: number;
  winRate: number;
  battleCount: number;
};

type SectionLabels = {
  title: string;
  pickRate: string;
  winRate: string;
  battleCount: string;
  gadgets: string;
  starPowers: string;
  gears: string;
  empty: string;
};

type BrawlerStatsSectionProps = {
  stats: BrawlerStat[];
  labels: SectionLabels;
  limit?: number;
};

const gadgetBg = "/gadgetBg.png";
const starPowerBadge = "/starPowerBadge.png";

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

export function BrawlerStatsSection({
  stats,
  labels,
  limit = 5,
}: BrawlerStatsSectionProps) {
  if (!stats || stats.length === 0) {
    return (
      <section className={styles.wrapper}>
        <h2>{labels.title}</h2>
        <p className={styles.empty}>{labels.empty}</p>
      </section>
    );
  }

  const sliced = stats.slice(0, limit);

  return (
    <section className={styles.wrapper}>
      <h2>{labels.title}</h2>
      <div className={styles.list}>
        {sliced.map((brawler) => {
          const pickRatePercent = Math.round(brawler.pickRate * 1000) / 10;
          const winRatePercent = Math.round(brawler.winRate * 1000) / 10;
          const winRateClass =
            winRatePercent >= 60
              ? `${styles.winRate} ${styles.victory}`
              : winRatePercent < 50
                ? `${styles.winRate} ${styles.defeat}`
                : styles.winRate;

          return (
            <article key={brawler.id} className={styles.item}>
              <div className={styles.iconColumn}>
                <Image
                  src={`https://cdn.brawlify.com/brawlers/borders/${brawler.id}.png`}
                  alt={brawler.name || `Brawler ${brawler.id}`}
                  width={64}
                  height={64}
                  sizes="64px"
                  className={styles.icon}
                />
              </div>
              <div className={styles.progressColumn}>
                <div className={styles.labelRow}>
                  <span>{labels.pickRate}</span>
                  <span className={styles.value}>
                    {pickRatePercent.toFixed(1)}%
                  </span>
                </div>
                <div className={styles.track}>
                  <div
                    className={styles.fill}
                    style={{ width: `${Math.min(pickRatePercent, 100)}%` }}
                  />
                </div>
                <div className={styles.metaRow}>
                  <span className={winRateClass}>
                    {labels.winRate}: {winRatePercent.toFixed(1)}%
                  </span>
                  <span className={styles.battles}>
                    {labels.battleCount}: {brawler.battleCount}
                  </span>
                </div>
              </div>
              <div className={styles.upgradeColumn}>
                <ul className={styles.upgradeGroup} aria-label={labels.gadgets}>
                  {brawler.gadgets.map((id) => (
                    <li key={`g-${id}`} className={styles.upgradeIcon}>
                      <Image
                        src={`https://cdn.brawlify.com/gadgets/borderless/${id}.png`}
                        alt={`Gadget ${id}`}
                        width={20}
                        height={20}
                        sizes="20px"
                        style={{ width: 20, height: 20 }}
                      />
                      <Image
                        src={gadgetBg}
                        alt="gadget background"
                        width={42}
                        height={42}
                        sizes="42px"
                        className={styles.upgradeFrame}
                      />
                    </li>
                  ))}
                </ul>
                <ul
                  className={styles.upgradeGroup}
                  aria-label={labels.starPowers}
                >
                  {brawler.starPowers.map((id) => (
                    <li key={`s-${id}`} className={styles.upgradeIcon}>
                      <Image
                        src={`https://cdn.brawlify.com/star-powers/borderless/${id}.png`}
                        alt={`Star power ${id}`}
                        width={20}
                        height={20}
                        sizes="20px"
                        className={styles.starPower}
                      />
                      <Image
                        src={starPowerBadge}
                        alt="star power badge"
                        width={42}
                        height={42}
                        sizes="42px"
                        className={styles.upgradeFrame}
                      />
                    </li>
                  ))}
                </ul>
                <ul className={styles.gearGroup} aria-label={labels.gears}>
                  {brawler.gears.map((id) => (
                    <li key={`gear-${id}`} className={styles.gearItem}>
                      <Image
                        src={`https://cdn.brawlify.com/gears/regular/${id}.png`}
                        alt={`Gear ${id}`}
                        width={28}
                        height={28}
                        sizes="28px"
                        className={styles.gear}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
