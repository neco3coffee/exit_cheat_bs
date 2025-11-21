import Image from "next/image";
import Link from "next/link";
import styles from "./index.module.scss";

export default function MapList({
  locale,
  maps,
}: {
  locale: string;
  maps: string[];
}) {
  return (
    <div className={styles.container}>
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
