import { cacheLife } from "next/cache";
import Image from "next/image";
import { Suspense } from "react";
import styles from "./page.module.scss";

const apiUrl = "http://app:3000";

export async function getBrawlerPickRateByMap(mapId: number) {
  "use cache";
  cacheLife("hours");

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
        className={styles.mapImage}
      />
    </div>
  );
}
