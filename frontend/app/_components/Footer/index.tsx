import { cacheLife } from "next/cache";
import { AccountIcon, HomeIcon, RankedIcon } from "./_components/client/Icons";
import styles from "./index.module.scss";

interface FooterProps {
  params: Promise<{ locale: string }>;
}

export default async function Footer({ params }: FooterProps) {
  "use cache";
  cacheLife("max");

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <HomeIcon />
        <RankedIcon />
        <AccountIcon />
      </div>
    </footer>
  );
}
