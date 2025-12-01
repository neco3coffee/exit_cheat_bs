import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import styles from "./index.module.scss";

export default async function MapList({
  locale,
  maps,
}: {
  locale: string;
  maps: string[];
}) {
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{t("map.title")}</h3>
      <span className={styles.description}>{t("map.description")}</span>
      {maps.map((mapId, _index) => {
        return (
          <Link
            key={mapId}
            href={`/${locale}/maps/${mapId}`}
            className={styles.mapLink}
          >
            <Image
              src={`https://cdn.brawlify.com/maps/regular/${mapId}.png`}
              alt={`Map ${mapId}`}
              width={100}
              height={100}
              className={styles.mapImage}
            />
          </Link>
        );
      })}
    </div>
  );
}
