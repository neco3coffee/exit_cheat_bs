import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import Loading from "@/app/_components/Loading";
import VideoPlayer from "@/app/_components/VideoPlayer.tsx";
import { formatBattleLog } from "@/app/_lib/formatBattleLog";
import { getCurrentPlayer } from "@/app/_lib/serverAuth";
import RankedPage from "@/app/[locale]/(authed)/ranked/_components/RankedPage";
import BattleLogSoloRanked from "./_components/BattleLogSoloRanked";
import ReportedBattleLogSoloRanked from "./_components/ReportedBattleLogSoloRanked";
import ReportedPlayersList from "./_components/ReportedPlayersList";
import type { ReportedPlayer } from "./_components/ReportedPlayersList/types";
import styles from "./page.module.scss";

const apiUrl = "http://app:3000";

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
  cacheTag(`reports-${playerTag}`);

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

async function getReportedPlayers(playerTag: string, sessionToken: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(`reportedPlayers-${playerTag}`);

  const res = await fetch(
    `${apiUrl}/api/v1/players/${encodeURIComponent(
      playerTag,
    )}/reported_players`,
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

// TODO:データ取得をそれぞれのコンポーネントでおこなって、そのコンポーネントをSuspenseでラップする形にリファクタリングする
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = (await params).locale;
  const t = await getTranslations({ locale, namespace: "ranked" });
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value || "";

  const player = sessionToken ? await getCurrentPlayer() : null;

  if (!player) {
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

  const playerTag = player?.tag?.startsWith("#")
    ? player.tag.substring(1)
    : player?.tag;
  const battleLogs = playerTag ? await getBattleLogs(playerTag) : null;
  const reports = playerTag ? await getReports(playerTag, sessionToken) : null;
  const recentReport = await getRecentReport();
  const reportedPlayers = await getReportedPlayers(playerTag, sessionToken);

  return (
    <RankedPage
      locale={locale}
      player={player}
      recentReportComponent={
        <RecentVideoComponent locale={locale} recentReport={recentReport} />
      }
      battleLogsTabContent={
        <BattleLogsTabContent
          params={params}
          locale={locale}
          player={player}
          battleLogs={battleLogs || []}
          reports={reports || []}
        />
      }
      reportsTabContent={
        <ReportsTabContent locale={locale} reports={reports || []} />
      }
      reportedPlayersTabContent={
        <ReportedPlayersTabContent
          locale={locale}
          reportedPlayers={reportedPlayers}
        />
      }
    />
  );
}

export async function RecentVideoComponent({
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

  if (!recentReport || !videoUrl) {
    return (
      <div className={styles.recentVideoContainer}>
        <h5>{t("noRecentReport")}</h5>
      </div>
    );
  }

  return (
    <div className={styles.recentVideoContainer}>
      <div className={styles.mainVideoDescription}>{mainVideoDescription}</div>
      <VideoPlayer src={videoUrl} />
      {/* <video
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
      </video> */}
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

async function ReportedPlayersTabContent({
  locale,
  reportedPlayers,
}: {
  locale: string;
  reportedPlayers: ReportedPlayer[] | [];
}) {
  "use cache";
  cacheLife("minutes");

  const t = await getTranslations({ locale, namespace: "ranked" });

  return (
    <ReportedPlayersList
      locale={locale}
      players={reportedPlayers}
      emptyMessage={t("noReportedPlayers")}
    />
  );
}

async function BattleLogsTabContent({
  params,
  locale,
  player,
  battleLogs,
  reports,
}: {
  params: Promise<{ locale: string }>;
  locale: string;
  player: any;
  battleLogs: any[];
  reports: any[];
}) {
  "use cache";
  cacheLife("seconds");
  const t = await getTranslations({ locale, namespace: "ranked" });

  const tag = player?.tag?.startsWith("#")
    ? player.tag.substring(1)!
    : player?.tag;

  const reportKeys = new Set(
    reports?.map((r) =>
      r?.battle_data?.battle?.teams
        .flat()
        .map((p: any) => p.tag)
        .sort()
        .join("-"),
    ) || [],
  );

  return (
    <div className={styles.battlelogContainer}>
      {!battleLogs || battleLogs.length === 0 ? (
        <h5>{t("noBattleLog")}</h5>
      ) : (
        battleLogs.map((battleLog, index) => {
          const battlelog = battleLogs[index];
          const battleKey = battlelog?.battle?.teams
            ?.flat()
            ?.map((p: any) => p.tag)
            ?.sort()
            ?.join("-");
          const isReported = reportKeys.has(battleKey);

          return (
            <BattleLogSoloRanked
              params={params}
              locale={locale}
              key={`${battleKey}-${battleLog?.battleTime}`}
              battleLog={battlelog}
              ownTag={tag}
              isReported={isReported}
            />
          );
        })
      )}
    </div>
  );
}

async function ReportsTabContent({
  locale,
  reports,
}: {
  locale: string;
  reports: any[];
}) {
  "use cache";
  cacheLife("minutes");

  const t = await getTranslations({ locale, namespace: "ranked" });

  return (
    <div className={styles.reportsContainer}>
      {reports && reports.length > 0 ? (
        reports.map((report) => {
          const battleLog = report.battle_data;
          const ownTag = report.reporter_tag.startsWith("#")
            ? report.reporter_tag.substring(1)
            : report.reporter_tag;

          return (
            <ReportedBattleLogSoloRanked
              locale={locale}
              key={`report-${report.id}`}
              battleLog={battleLog}
              ownTag={ownTag}
              status={report.status}
              reported_tag={report.reported_tag}
              video_url={report.video_url}
              report={report}
              reportId={report.id}
            />
          );
        })
      ) : (
        <h5>{t("noReport")}</h5>
      )}
    </div>
  );
}
