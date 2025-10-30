import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { formatBattleLog } from "@/app/_lib/formatBattleLog";
import ServerLocaleMessageProviderWrapper from "@/app/_messages/ServerLocaleMessageProviderWrapper";
import RankedPage from "@/app/[locale]/ranked/_components/client/RankedPage";
import styles from "./page.module.scss";

const apiUrl = "http://app:3000";

async function getPlayerData(sessionToken: string) {
  "use cache";
  cacheLife("weeks");

  const res = await fetch(`${apiUrl}/api/v1/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `session_token=${sessionToken}`,
    },
    credentials: "include",
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

async function getBattleLogs(playerTag: string) {
  "use cache";
  cacheLife("seconds");

  const res = await fetch(
    `${apiUrl}/api/v1/players/${encodeURIComponent(playerTag)}/ranked`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  const formattedBattleLogs = formatBattleLog(data.battle_logs);
  return formattedBattleLogs;
}

async function getReports(playerTag: string, sessionToken: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("reports");

  const res = await fetch(
    `${apiUrl}/api/v1/players/${encodeURIComponent(playerTag)}/reports`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session_token=${sessionToken}`,
      },
      credentials: "include",
    },
  );
  if (!res.ok) {
    return [];
  }
  return res.json();
}

async function getRecentReport() {
  "use cache";
  cacheLife("minutes");

  const res = await fetch(`${apiUrl}/api/v1/reports/latest`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    return null;
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

  const res = await fetch(`${apiUrl}/api/v1/reports`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `session_token=${sessionToken}`,
    },
    credentials: "include",
  });
  if (!res.ok) {
    return [];
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
          <Link className={styles.login} href={`/${locale}/account`}>
            {t("login")}
          </Link>
        </div>
      </div>
    );
  }

  const playerData = await (sessionToken ? getPlayerData(sessionToken) : null);

  if (!playerData || !playerData?.player) {
    return (
      <div className={styles.container}>
        <div className={styles.inner}>
          <p>{t("unauthenticated")}</p>
          <Link className={styles.login} href={`/${locale}/account`}>
            {t("login")}
          </Link>
        </div>
      </div>
    );
  }
  const player = playerData.player;

  const playerTag = player?.tag?.startsWith("#")
    ? player.tag.substring(1)
    : player?.tag;
  const battleLogs = playerTag ? await getBattleLogs(playerTag) : null;
  const reports = playerTag ? await getReports(playerTag, sessionToken) : null;
  const recentReport = await getRecentReport();
  let waitingReviewReports = null;
  if (player.role === "admin" || player.role === "moderator") {
    waitingReviewReports = await getWaitingReviewReports(sessionToken);
  }

  return (
    <ServerLocaleMessageProviderWrapper params={params}>
      <RankedPage
        player={player}
        battleLogs={battleLogs || []}
        reports={reports || []}
        waitingReviewReports={waitingReviewReports || []}
        recentReportComponent={
          <RecentVideoComponent locale={locale} recentReport={recentReport} />
        }
      />
    </ServerLocaleMessageProviderWrapper>
  );
}

async function RecentVideoComponent({
  locale,
  recentReport,
}: {
  locale: string;
  recentReport: any;
}) {
  "use cache";
  cacheLife("minutes");

  const t = await getTranslations({ locale, namespace: "ranked" });
  const mainVideoDescription = t("mainVideoDescription");
  const videoUrl = recentReport?.video_url || null;

  return (
    <div className={styles.recentVideoContainer}>
      <div className={styles.mainVideoDescription}>{mainVideoDescription}</div>
      <video
        id="mainVideo"
        key={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        src={videoUrl}
        preload="none"
      >
        <track kind="captions" src={videoUrl} label="No captions" />
      </video>
      <div className={styles.reportInfo}>
        <div className={styles.reportedPlayerIconContainer}>
          <Image
            src={`https://cdn.brawlify.com/brawlers/borderless/${recentReport.battle_data.battle.teams.flat().find((p: any) => p.tag === recentReport.reported_tag).brawler.id}.png`}
            alt="reported brawler"
            width={50}
            height={50}
            sizes="50px"
            style={{ height: "50px", width: "auto" }}
          />
          <Image
            src="/reported_player.png"
            alt="reported player"
            width={24}
            height={24}
            sizes="24px"
            className={styles.reportedIcon}
          />
        </div>
        <p>
          {
            recentReport.battle_data.battle.teams
              .flat()
              .find((p: any) => p.tag === recentReport.reported_tag).name
          }
        </p>
      </div>
    </div>
  );
}
