import { cacheLife } from "next/cache";
import { Suspense } from "react";
import ServerLocaleMessageProviderWrapper from "@/app/_messages/ServerLocaleMessageProviderWrapper";
import Loading from "../ranked/loading";
import FAQ from "./_components/client/FAQ";
import InstallPrompt from "./_components/client/InstallPrompt";
import NameInput from "./_components/client/NameInput";
import TagInput from "./_components/client/TagInput";
import MapList from "./_components/server/MapList";
import styles from "./page.module.scss";

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

async function getMaps() {
  "use cache";
  cacheLife("days");

  if (process.env.NEXT_PHASE === "phase-production-build") {
    return { maps: [] };
  }

  const response = await fetch(`${apiUrl}/api/v1/maps`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    console.error("Failed to fetch maps:", response.statusText);
    return { maps: [] };
  }
  const data = await response.json();
  if (!data || typeof data !== "object" || !Array.isArray((data as any).maps)) {
    console.warn("Unexpected maps payload", data);
    return { maps: [] };
  }
  return data as { maps: string[] };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <HomePage params={params} />
    </Suspense>
  );
}

async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { maps } = await getMaps();
  console.log("maps:", maps);

  return (
    <>
      <div className={styles.margin}></div>
      {/* <InstallPrompt /> */}
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
      <MapList locale={locale} maps={maps} />
      <Suspense fallback={null}>
        <ServerLocaleMessageProviderWrapper params={params}>
          <FAQ />
        </ServerLocaleMessageProviderWrapper>
      </Suspense>
    </>
  );
}
