import { cacheLife } from "next/cache";
import ServerLocaleMessageProviderWrapper from "@/app/_messages/ServerLocaleMessageProviderWrapper";
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
        <ServerLocaleMessageProviderWrapper params={params}>
          <HomeIcon />
          <RankedIcon />
          <AccountIcon />
        </ServerLocaleMessageProviderWrapper>
      </div>
    </footer>
  );
}
