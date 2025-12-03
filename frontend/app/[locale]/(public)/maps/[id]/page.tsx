import { cacheLife } from "next/cache";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import styles from "./page.module.scss";
import { getMaps } from "../../(home)/page";

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

// export async function generateStaticParams(): Promise<{ id: string }[]> {
//   const result = await getMaps();
//   const maps = result?.maps ?? [];

//   return maps.map((mapId) => ({
//     id: mapId.toString(),
//   }));
// }


export async function getBrawlerPickRateByMap(mapId: number) {
  "use cache";
  cacheLife("minutes");

  const res = await fetch(`${apiUrl}/api/v1/maps/${mapId}/brawler_pick_rate`, {
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

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <MapPage promiseParams={params} />
    </Suspense>
  );
}

async function MapPage({
  promiseParams,
}: {
  promiseParams: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await promiseParams;
  const t = await getTranslations({ locale, namespace: "maps" });

  const brawlerPickRateData = await getBrawlerPickRateByMap(Number(id));

  const { map_id, brawler_pick_rates } = brawlerPickRateData || {
    map_id: null,
    brawler_pick_rates: [],
  };
  console.log(brawlerPickRateData);

  return (
    <div className={styles.container}>
      <Image
        src={`https://cdn.brawlify.com/maps/regular/${id}.png`}
        alt="map"
        width={360}
        height={400}
        sizes="360px"
        // className={styles.mapImage}
      />

      <p className={styles.notice}>{t("masterNotice")}</p>

      <div className={styles.pickRateList}>
        {brawler_pick_rates && brawler_pick_rates.length > 0 ? (
          brawler_pick_rates.map(
            (brawler: {
              brawler_id: number;
              pick_rate: number;
              win_rate: number;
              battle_count: number;
            }) => {
              const pickRatePercent = Math.round(brawler.pick_rate * 1000) / 10; // 0.1% precision
              const winRatePercent = Math.round(brawler.win_rate * 1000) / 10;
              const winRateClass =
                winRatePercent >= 60
                  ? `${styles.winRate} ${styles.winRateVictory}`
                  : winRatePercent < 50
                    ? `${styles.winRate} ${styles.winRateDefeat}`
                    : styles.winRate;

              return (
                <div key={brawler.brawler_id} className={styles.pickRateItem}>
                  <Image
                    src={`https://cdn.brawlify.com/brawlers/borders/${brawler.brawler_id}.png`}
                    alt="brawler"
                    width={48}
                    height={48}
                    sizes="48px"
                    className={styles.brawlerIcon}
                  />

                  <div className={styles.pickRateContent}>
                    <div className={styles.pickRateBarRow}>
                      <div className={styles.pickRateBarTrack}>
                        <div
                          className={styles.pickRateBarFill}
                          style={{
                            width: `${Math.min(pickRatePercent, 100)}%`,
                          }}
                        />
                      </div>
                      <span className={styles.pickRateValue}>
                        {pickRatePercent.toFixed(1)}%
                      </span>
                    </div>

                    <div className={styles.pickRateMeta}>
                      <span className={winRateClass}>
                        🏆{winRatePercent.toFixed(1)}%
                      </span>
                      <span className={styles.battleCount}>
                        {brawler.battle_count}⚔️
                      </span>
                    </div>
                  </div>
                </div>
              );
            },
          )
        ) : (
          <p className={styles.noDataText}>No data available.</p>
        )}
      </div>
    </div>
  );
}
