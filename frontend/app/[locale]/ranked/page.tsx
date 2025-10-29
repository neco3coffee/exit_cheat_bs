import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { formatBattleLog } from "@/app/_lib/formatBattleLog";
import ServerLocaleMessageProviderWrapper from "@/app/_messages/ServerLocaleMessageProviderWrapper";
import RankedPage from "@/app/[locale]/ranked/_components/client/RankedPage";
import styles from "./page.module.scss";

async function getPlayerData(sessionToken: string) {
  "use cache";
  cacheLife("weeks");

  const backendUrl = "http://app:3000";

  const res = await fetch(`${backendUrl}/api/v1/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `session_token=${sessionToken}`,
    },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch player data");
  }
  return res.json();
}

async function getBattleLogs(playerTag: string) {
  "use cache";
  cacheLife("seconds");

  const backendUrl = "http://app:3000";

  const res = await fetch(
    `${backendUrl}/api/v1/players/${encodeURIComponent(playerTag)}/ranked`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch battle logs");
  }
  const data = await res.json();
  const formattedBattleLogs = formatBattleLog(data.battle_logs);
  return formattedBattleLogs;
}

async function getReports(playerTag: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("reports");

  const backendUrl = "http://app:3000";

  const res = await fetch(
    `${backendUrl}/api/v1/players/${encodeURIComponent(playerTag)}/reports`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!res.ok) {
    throw new Error("Failed to fetch reports");
  }
  return res.json();
}

async function getRecentReport() {
  "use cache";
  cacheLife("minutes");

  const backendUrl = "http://app:3000";

  const res = await fetch(`${backendUrl}/api/v1/reports/latest`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch recent report");
  }
  const reports = await res.json();
  if (reports.length === 0) {
    return null;
  }
  return reports[0];
}

async function getWaitingReviewReports(sessionToken: string) {
  "use cache";
  cacheLife("minutes");

  const backendUrl = "http://app:3000";

  const res = await fetch(`${backendUrl}/api/v1/reports`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `session_token=${sessionToken}`,
    },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch reports");
  }
  return res.json();
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const sessionToken = (await cookies()).get("session_token")?.value || null;
  const locale = (await params).locale;
  const t = await getTranslations({ locale, namespace: "ranked" });

  if (!sessionToken) {
    return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <p>{t("unauthenticated")}</p>
          <Link className={styles.login} href="/account">
            {t("login")}
          </Link>
        </div>
      </div>
    );
  }

  const { player } = await (sessionToken ? getPlayerData(sessionToken) : null);
  const playerTag = player?.tag?.startsWith("#")
    ? player.tag.substring(1)
    : player?.tag;
  const battleLogs = playerTag ? await getBattleLogs(playerTag) : null;
  const reports = playerTag ? await getReports(playerTag) : null;
  const recentReport = await getRecentReport();
  const waitingReviewReports = sessionToken
    ? await getWaitingReviewReports(sessionToken)
    : null;

  return (
    <ServerLocaleMessageProviderWrapper params={params}>
      <RankedPage
        player={player}
        battleLogs={battleLogs || []}
        reports={reports || []}
        recentReport={recentReport}
        waitingReviewReports={waitingReviewReports || []}
      />
    </ServerLocaleMessageProviderWrapper>
  );
}
