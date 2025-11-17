import Image from "next/image";
import Link from "next/link";
import { appendToEightDigits } from "@/app/_lib/common";
import styles from "./PersonList.module.scss";

type Person = {
  tag: string;
  name: string;
  icon_id: number;
  rank: number;
  battle_count: number;
  win_rate: number;
};

type PersonListProps = {
  locale: string;
  title: string;
  people: Person[];
  labels: {
    winRate: string;
    battleCount: string;
    rank: (rank: number) => string;
    empty: string;
  };
};

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

export function PersonList({ locale, title, people, labels }: PersonListProps) {
  return (
    <section className={styles.wrapper}>
      <h2>{title}</h2>
      {people.length === 0 ? (
        <p className={styles.empty}>{labels.empty}</p>
      ) : (
        <ul className={styles.list}>
          {people.map((person) => {
            const normalizedTag = person.tag.replace(/^#?/, "");
            const rankImageId = appendToEightDigits(
              58000000,
              Math.max(person.rank - 1, 0),
            );
            const hasRankImage = person.rank > 0;

            return (
              <li key={person.tag} className={styles.item}>
                <div className={styles.avatar}>
                  <Image
                    src={`https://cdn.brawlify.com/profile-icons/regular/${person.icon_id}.png`}
                    alt={person.name}
                    width={56}
                    height={56}
                    sizes="56px"
                  />
                </div>
                <div className={styles.meta}>
                  <Link
                    href={`/${locale}/players/${normalizedTag}`}
                    className={styles.name}
                  >
                    {person.name || `#${normalizedTag}`}
                  </Link>
                  <div className={styles.subline}>
                    <span className={styles.tag}>#{normalizedTag}</span>
                    {hasRankImage ? (
                      <span className={styles.rank}>
                        <Image
                          src={`https://cdn.brawlify.com/ranked/tiered/${rankImageId}.png`}
                          alt={labels.rank(person.rank)}
                          width={36}
                          height={36}
                          sizes="36px"
                        />
                      </span>
                    ) : (
                      <span className={styles.rankText}>
                        {labels.rank(person.rank)}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.stats}>
                  <span className={styles.winRate}>
                    {labels.winRate}
                    <strong>{formatPercent(person.win_rate)}</strong>
                  </span>
                  <span className={styles.battles}>
                    {labels.battleCount}
                    <strong>{person.battle_count}</strong>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
