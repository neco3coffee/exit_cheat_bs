import { cacheLife } from "next/cache";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import styles from "./page.module.scss";
import { getMaps } from "../../(home)/page";

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

const exampleMaps = [15000292, 15000050, 15000548, 15000025, 15000118, 15000300, 15000022, 15000053, 15000368, 15000005, 15000007, 15000293, 15000011, 15000072, 15001023, 15000082, 15000350, 15000019, 15000440, 15000010, 15000018, 15000703, 15000289, 15000306, 15000132, 15000115]

export async function generateStaticParams(): Promise<{ id: string }[]> {
  return exampleMaps.map((id) => ({
    id: id.toString(),
  }));
}


export async function getBrawlerPickRateByMap(mapId: number) {
  if (process.env.SKIP_BUILD_FETCH === "true") {
    return { map_id: null, brawler_pick_rates: [] };
  }

  const res = await fetch(`${apiUrl}/api/v1/maps/${mapId}/brawler_pick_rate`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 300 },
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
