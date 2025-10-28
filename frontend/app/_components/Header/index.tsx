import { cacheLife } from "next/cache";
import { Suspense } from "react";
import LocaleBoxContent from "./_components/client/LocaleBoxContent";
import styles from "./index.module.scss";

export default async function Header() {
  "use cache";
  cacheLife("max");

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}></div>
      <h1>SafeBrawl</h1>

      <div className={styles.localeContainer}>
        <Suspense fallback={null}>
          <LocaleBoxContent />
        </Suspense>
      </div>
    </header>
  );
}
