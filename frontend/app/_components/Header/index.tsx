import { MailPlus } from "lucide-react";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import ServerLocaleMessageProviderWrapper from "@/app/_messages/ServerLocaleMessageProviderWrapper";
import LocaleBoxContent from "./_components/client/LocaleBoxContent";
import SafeBrawlMenuContent from "./_components/client/SafeBrawlMenuContent";
import styles from "./index.module.scss";

export default async function Header({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  "use cache";
  cacheLife("max");

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <a
          href="https://x.com/neco3desu"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.contactLink}
        >
          <MailPlus />
        </a>
      </div>
      <Suspense fallback={<h1>SafeBrawl</h1>}>
        <ServerLocaleMessageProviderWrapper params={params}>
          <SafeBrawlMenuContent />
        </ServerLocaleMessageProviderWrapper>
      </Suspense>

      <div className={styles.localeContainer}>
        <Suspense fallback={null}>
          <LocaleBoxContent />
        </Suspense>
      </div>
    </header>
  );
}
