"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./SeasonCountdown.module.scss";

type SeasonCountdownProps = {
  startDateTime: string;
  endDateTime: string;
  labels: {
    inSeason: string;
    downtime: string;
    unavailable: string;
  };
};

const formatDuration = (milliseconds: number): string => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));

  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  const parts = [] as string[];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  parts.push(`${hh}h${mm}m${ss}s`);

  return parts.join("");
};

export function SeasonCountdown({
  startDateTime,
  endDateTime,
  labels,
}: SeasonCountdownProps) {
  const seasonStart = useMemo(() => new Date(startDateTime), [startDateTime]);
  const seasonEnd = useMemo(() => new Date(endDateTime), [endDateTime]);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      setNow(Date.now());
    };
    tick();

    const timer = window.setInterval(() => {
      tick();
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  if (
    Number.isNaN(seasonStart.getTime()) ||
    Number.isNaN(seasonEnd.getTime())
  ) {
    return (
      <div className={styles.container}>
        <span className={styles.label}>{labels.unavailable}</span>
      </div>
    );
  }

  const isDowntime = now !== null ? now < seasonStart.getTime() : false;
  const target = isDowntime ? seasonStart : seasonEnd;
  const label =
    now !== null
      ? isDowntime
        ? labels.downtime
        : labels.inSeason
      : labels.inSeason;
  const countdown =
    now !== null ? formatDuration(target.getTime() - now) : "--";

  return (
    <div className={styles.container}>
      <span
        className={`${styles.label} ${isDowntime ? styles.downtime : ""}`.trim()}
      >
        {label}
      </span>
      <span className={styles.value}>{countdown}</span>
    </div>
  );
}
