import { Suspense } from "react";
import ServerLocaleMessageProviderWrapper from "@/app/_messages/ServerLocaleMessageProviderWrapper";
import { AccountIcon, HomeIcon, RankedIcon } from "./_components/client/Icons";
import styles from "./index.module.scss";

interface FooterProps {
  params: Promise<{ locale: string }>;
}

const Footer = ({ params }: FooterProps) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <Suspense fallback={null}>
          <ServerLocaleMessageProviderWrapper params={params}>
            <HomeIcon />
            <RankedIcon />
            <AccountIcon />
          </ServerLocaleMessageProviderWrapper>
        </Suspense>
      </div>
    </footer>
  );
};

export default Footer;
