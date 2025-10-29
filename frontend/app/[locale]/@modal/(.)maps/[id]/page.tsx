import Image from "next/image";
import { Modal } from "./modal";
import styles from "./page.module.scss";

export default async function MapModal({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  return (
    <Modal>
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
    </Modal>
  );
}
