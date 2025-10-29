import { cacheLife } from "next/cache";
import Image from "next/image";
import { Suspense } from "react";
import styles from "./page.module.scss";

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
