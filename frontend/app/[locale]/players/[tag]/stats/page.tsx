import { cacheLife } from "next/cache";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { SeasonCountdown } from "./_components/SeasonCountdown";
import styles from "./page.module.scss";

const apiUrl = "http://app:3000";

async function getPlayerData(tag: string) {
  "use cache";
  cacheLife("minutes");

  const res = await fetch(
    `${apiUrl}/api/v1/players/${encodeURIComponent(tag)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!res.ok) {
    return null;
  }
  return res.json();
}

async function getSeasonData() {
  "use cache";
  cacheLife("minutes");

  const res = await fetch(`${apiUrl}/api/v1/seasons/current`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export async function PlayerStatsPage({
  promiseParams,
}: {
  promiseParams: Promise<{ locale: string; tag: string }>;
}) {
  const { locale, tag } = await promiseParams;
  const t = await getTranslations({ locale, namespace: "playerStats" });

  const playerData = await getPlayerData(tag);

  const seasonData = await getSeasonData();
  console.log(playerData);
  if (!playerData) {
    return <div className={styles.container}>{t("playerNotFound")}</div>;
  }

  return (
    <div className={styles.container}>
      <SeasonCountdown
        startDateTime={seasonData?.startDateTime ?? ""}
        endDateTime={seasonData?.endDateTime ?? ""}
        labels={{
          inSeason: t("seasonCountdown.inSeason"),
          downtime: t("seasonCountdown.downtime"),
          unavailable: t("seasonCountdown.unavailable"),
        }}
      />
      {/* player, (icon,tag,name,currentRank) season(battleCount,winRate) */}

      {/* brawler(gear,gadget,starPower)3~5(pickRate, battleCount, winRate) */}

      {/* map(winRate) */}

      {/* highWinRateTeamMate3~5(player, winRate, battleCount) */}
      {/* ----------------------battleCount- */}
      {/* myIcon,teamMateIcon  -  winRate */}

      {/* mostDefeatedEnemy~5(player,  winRate, battleCount) */}
      {/* --------battleCount---------- */}
      {/* myIcon - winRate  - enemyIcon */}

      {/* battles */}
      {/* 一旦全件表示,1シーズンで100件程度想定、キャッシュは30分ごとに更新 */}
    </div>
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; tag: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <PlayerStatsPage promiseParams={params} />
    </Suspense>
  );
}
