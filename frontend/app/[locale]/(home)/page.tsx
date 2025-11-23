import { cacheLife } from "next/cache";
import { Suspense } from "react";
import ServerLocaleMessageProviderWrapper from "@/app/_messages/ServerLocaleMessageProviderWrapper";
import Loading from "../ranked/loading";
import FAQ from "./_components/client/FAQ";
import InstallPrompt from "./_components/client/InstallPrompt";
import NameInput from "./_components/client/NameInput";
import TagInput from "./_components/client/TagInput";
import MapList from "./_components/server/MapList";
import SeasonRankingList from "./_components/server/SeasonRankingList";
import styles from "./page.module.scss";

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

async function getMaps() {
  "use cache";
  cacheLife("minutes");

  if (process.env.NODE_PHASE === "phase-production-build") {
    return { maps: [] };
  }
  try {
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
    if (
      !data ||
      typeof data !== "object" ||
      !Array.isArray((data as any).maps)
    ) {
      console.warn("Unexpected maps payload", data);
      return { maps: [] };
    }
    return data as { maps: string[] };
  } catch (error) {
    console.error("Error fetching maps:", error);
    return { maps: [] };
  }
}

interface SeasonRanking {
  ranking: number;
  tag: string;
  name: string;
  iconId: number;
  rank: number;
  battlesCount: number;
  winRate: number;
}

async function getSeasonRankings() {
  "use cache";
  cacheLife("minutes");

  try {
    const response = await fetch(`${apiUrl}/api/v1/seasons/current/rankings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.error("Failed to fetch season rankings:", response.statusText);
      return [];
    }
    const data = await response.json();
    console.log("season rankings data:", data);
    return data as SeasonRanking[];
  } catch (error) {
    console.error("Error fetching season rankings:", error);
    return [];
  }
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
  const seasonRankings = await getSeasonRankings();
  console.log("maps:", maps);
  console.log("seasonRankings", seasonRankings);
  console.log("apiUrl", apiUrl);

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
      <SeasonRankingList locale={locale} seasonRankings={seasonRankings} />
      <MapList locale={locale} maps={maps} />
      <Suspense fallback={null}>
        <ServerLocaleMessageProviderWrapper params={params}>
          <FAQ />
        </ServerLocaleMessageProviderWrapper>
      </Suspense>
    </>
  );
}
