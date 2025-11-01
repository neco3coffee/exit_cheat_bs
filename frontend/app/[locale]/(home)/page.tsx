import { Suspense } from "react";
import ServerLocaleMessageProviderWrapper from "@/app/_messages/ServerLocaleMessageProviderWrapper";
import FAQ from "./_components/client/FAQ";
import InstallPrompt from "./_components/client/InstallPrompt";
import NameInput from "./_components/client/NameInput";
import TagInput from "./_components/client/TagInput";
import styles from "./page.module.scss";

export default function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <>
      <div className={styles.margin}></div>
      <Suspense fallback={null}>
        <ServerLocaleMessageProviderWrapper params={params}>
          <TagInput />
        </ServerLocaleMessageProviderWrapper>
      </Suspense>
      <Suspense fallback={null}>
        <ServerLocaleMessageProviderWrapper params={params}>
          <NameInput />
        </ServerLocaleMessageProviderWrapper>
      </Suspense>
      <InstallPrompt />
      <Suspense fallback={null}>
        <ServerLocaleMessageProviderWrapper params={params}>
          <FAQ />
        </ServerLocaleMessageProviderWrapper>
      </Suspense>
    </>
  );
}
