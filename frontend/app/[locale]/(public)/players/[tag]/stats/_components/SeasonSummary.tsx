import styles from "./SeasonSummary.module.scss";

type SummaryItem = {
  label: string;
  value: string;
  caption?: string;
};

type SeasonSummaryProps = {
  items: SummaryItem[];
};

export function SeasonSummary({ items }: SeasonSummaryProps) {
  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <div key={item.label} className={styles.card}>
          <span className={styles.label}>{item.label}</span>
          <strong className={styles.value}>{item.value}</strong>
          {item.caption ? (
            <span className={styles.caption}>{item.caption}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
