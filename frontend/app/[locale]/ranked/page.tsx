"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { List, type RowComponentProps } from "react-window";
import { formatBattleLog } from "@/app/_lib/formatBattleLog";
import { Link } from "@/app/_messages/i18n/navigation";
import BattleLogSoloRanked from "@/app/[locale]/ranked/_components/BattleLogSoloRanked";
import ReportedBattleLogSoloRanked from "@/app/[locale]/ranked/_components/ReportedBattleLogSoloRanked";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import styles from "./page.module.scss";

const Status = {
  Idle: "Idle",
  Loading: "Loading",
  Authenticated: "Authenticated",
  Unauthenticated: "Unauthenticated",
  Error: "Error",
};

interface Player {
  id: number;
  tag: string;
  name: string;
  club_name?: string | null;
  trophies: number;
  current_icon: string;
  rank: number;
  role?: string;
}

export default function RankedPage() {
  const [status, setStatus] = useState(Status.Idle);
  const [player, setPlayer] = useState<Player | null>(null);
  const [battleLogs, setBattleLogs] = useState<any[]>([]);
  const [reports, setReports] = useState<any[] | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [approvedReports, setApprovedReports] = useState<any[]>([]);
  const [waitingReviewReports, setWaitingReviewReports] = useState<any[]>([]);
  const [displayingReport, setDisplayingReport] = useState<any>(null);
  const [mainVideoDescription, setMainVideoDescription] = useState<string>("");
  const t = useTranslations("ranked");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(true);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !videoUrl) return;

    const handlePlay = () => setIsPaused(false);
    const handlePause = () => setIsPaused(true);

    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);

    return () => {
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
    };
  }, [videoUrl]);

  const reportKeys = useMemo(() => {
    return new Set(
      reports?.map((r) =>
        r?.battle_data?.battle?.teams
          .flat()
          .map((p: any) => p.tag)
          .sort()
          .join("-"),
      ) || [],
    );
  }, [reports]);

  const tag = player?.tag?.startsWith("#")
    ? player.tag.substring(1)!
    : player?.tag!;

  const stableRowProps = useMemo(() => {
    return { battleLogs, reportKeys, tag };
  }, [battleLogs, reportKeys, tag]);

  const checkAuth = async () => {
    setStatus(Status.Loading);

    const sessionToken = localStorage.getItem("session_token");
    if (!sessionToken) {
      setStatus(Status.Unauthenticated);
      return;
    }

    try {
      const res = await fetch("/api/v1/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        setStatus(Status.Unauthenticated);
        return;
      }

      const data = await res.json();
      if (data && data.player) {
        setPlayer(data.player);
        setStatus(Status.Authenticated);
      } else {
        setStatus(Status.Unauthenticated);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setStatus(Status.Error);
    }
  };

  // biome-ignore-start lint/correctness/useExhaustiveDependencies: レンダーのたびに実行されてほしくないため
  useEffect(() => {
    checkAuth();
  }, []);
  // biome-ignore-end lint/correctness/useExhaustiveDependencies: レンダーのたびに実行されてほしくないため

  useEffect(() => {
    if (status !== Status.Authenticated || !player) return;
    // Fetch player data
    try {
      (async () => {
        const tag = player.tag.startsWith("#")
          ? player.tag.substring(1)
          : player.tag;
        const res = await fetch(
          `/api/v1/players/${encodeURIComponent(tag)}/ranked`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          const formattedBattleLogs = formatBattleLog(data.battle_logs);
          setBattleLogs(formattedBattleLogs);
        }
      })();
    } catch (error) {
      console.error("Error fetching player data:", error);
    }
  }, [status, player]);

  useEffect(() => {
    if (status !== Status.Authenticated || !player) return;
    // Fetch player reports
    try {
      (async () => {
        const tag = player.tag.startsWith("#")
          ? player.tag.substring(1)
          : player.tag;
        const res = await fetch(
          `/api/v1/players/${encodeURIComponent(tag)}/reports`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setReports(data);
        }
      })();
    } catch (error) {
      console.error("Error fetching player reports:", error);
    }
  }, [status, player]);

  const setVideo = (url: string | null) => {
    setVideoUrl(url);
    setIsPaused(true);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (status !== Status.Authenticated || !player) return;

    try {
      (async () => {
        const res = await fetch("/api/v1/reports/latest", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          const data = await res.json();
          setApprovedReports(data);
        }
      })();
    } catch (error) {
      console.error("Error fetching latest approved reports:", error);
    }
  }, [status, player]);

  useEffect(() => {
    if (approvedReports.length === 0) return;

    const randomIndex = Math.floor(Math.random() * approvedReports.length);
    const selectedReport = approvedReports[randomIndex];
    if (selectedReport?.video_url) {
      setVideoUrl(selectedReport.video_url);
      setDisplayingReport(selectedReport);
      setMainVideoDescription(t("mainVideoDescription"));
    }
  }, [approvedReports, t]);

  useEffect(() => {
    if (status !== Status.Authenticated || !player) return;

    const sessionToken = localStorage.getItem("session_token");

    try {
      (async () => {
        const res = await fetch("/api/v1/reports", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
        });
        if (res.ok) {
          const data = await res.json();
          setWaitingReviewReports(data);
        }
      })();
    } catch (error) {
      console.error("Error fetching reports waiting for review:", error);
    }
  }, [status, player]);

  if (status === Status.Idle || status === Status.Loading) {
    return (
      <div className={`${styles.container} justify-center`}>
        <Spinner className="size-12 text-blue-500" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {status === Status.Error && (
        <div className={styles.inner}>
          <p>{t("error")}</p>
        </div>
      )}
      {status === Status.Unauthenticated && (
        <div className={styles.inner}>
          <p>{t("unauthenticated")}</p>
          <Link className={styles.login} href="/account">
            {t("login")}
          </Link>
        </div>
      )}
      {status === Status.Authenticated && (
        <>
          <div className={styles.recentVideoContainer} ref={topRef}>
            {mainVideoDescription && (
              <div className={styles.mainVideoDescription}>
                {mainVideoDescription}
              </div>
            )}
            {isPaused && (
              <button
                className={styles.playButtonOverlay}
                onClick={() => videoRef.current?.play()}
                type="button"
              >
                <Image
                  src="/play_button.svg"
                  alt="Play Button"
                  width={64}
                  height={64}
                />
              </button>
            )}
            {videoUrl && (
              <video
                ref={videoRef}
                id="mainVideo"
                key={videoUrl}
                muted
                playsInline
                src={videoUrl}
                preload="none"
              >
                <track kind="captions" src={videoUrl} label="No captions" />
              </video>
            )}
            {displayingReport && (
              <div className={styles.reportInfo}>
                {
                  <div className={styles.reportedPlayerIconContainer}>
                    <Image
                      src={`https://cdn.brawlify.com/brawlers/borderless/${displayingReport.battle_data.battle.teams.flat().find((p: any) => p.tag === displayingReport.reported_tag).brawler.id}.png`}
                      alt="reported brawler"
                      width={50}
                      height={50}
                      style={{ height: "50px", width: "auto" }}
                    />
                    <Image
                      src="/reported_player.png"
                      alt="reported player"
                      width={24}
                      height={24}
                      className={styles.reportedIcon}
                    />
                  </div>
                }
                {
                  <p>
                    {
                      displayingReport.battle_data.battle.teams
                        .flat()
                        .find(
                          (p: any) => p.tag === displayingReport.reported_tag,
                        ).name
                    }
                  </p>
                }
              </div>
            )}
          </div>
          <Tabs className="w-full" defaultValue="battleLogs">
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="review" className={styles.tabTrigger}>
                {t("tabs.review")}
              </TabsTrigger>
              <TabsTrigger value="battleLogs" className={styles.tabTrigger}>
                {t("tabs.battleLog")}
              </TabsTrigger>
              <TabsTrigger value="reports" className={styles.tabTrigger}>
                {t("tabs.report")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="review">
              <div className={styles.reviewContainer}>
                {player?.role === "moderator" || player?.role === "admin" ? (
                  waitingReviewReports && waitingReviewReports.length > 0 ? (
                    waitingReviewReports.map((report) => {
                      const battleLog = report.battle_data;
                      const ownTag = report.reporter_tag.startsWith("#")
                        ? report.reporter_tag.substring(1)
                        : report.reporter_tag;

                      return (
                        <ReportedBattleLogSoloRanked
                          key={`report-${report.id}`}
                          battleLog={battleLog}
                          ownTag={ownTag}
                          status={report.status}
                          reported_tag={report.reported_tag}
                          video_url={report.video_url}
                          setVideoUrl={setVideo}
                          reason={report.reason}
                          reportId={report.id}
                          setDisplayingReport={setDisplayingReport}
                          setMainVideoDescription={setMainVideoDescription}
                          report={report}
                        />
                      );
                    })
                  ) : (
                    <h5 style={{ marginTop: "100px", marginBottom: "100px" }}>
                      {t("review.noReport")}
                    </h5>
                  )
                ) : (
                  <h5 style={{ marginTop: "100px", marginBottom: "100px" }}>
                    {t("review.onlyModerators")}
                  </h5>
                )}
              </div>
            </TabsContent>
            <TabsContent value="battleLogs">
              <div className={styles.battlelogContainer}>
                {!battleLogs || battleLogs.length === 0 ? (
                  <h5>No battle logs available.</h5>
                ) : (
                  <List
                    rowComponent={BattleLogRow}
                    rowCount={battleLogs.length}
                    rowHeight={rowHeight}
                    rowProps={stableRowProps}
                    style={{ width: "100%", height: "calc(100vh - 422px)" }} // 明示的に高さを指定する
                  />
                )}
              </div>
            </TabsContent>
            <TabsContent value="reports">
              <div className={styles.reportsContainer}>
                {reports && reports.length > 0 ? (
                  reports.map((report) => {
                    const battleLog = report.battle_data;
                    const ownTag = report.reporter_tag.startsWith("#")
                      ? report.reporter_tag.substring(1)
                      : report.reporter_tag;

                    return (
                      <ReportedBattleLogSoloRanked
                        key={`report-${report.id}`}
                        battleLog={battleLog}
                        ownTag={ownTag}
                        status={report.status}
                        reported_tag={report.reported_tag}
                        video_url={report.video_url}
                        setVideoUrl={setVideo}
                        setDisplayingReport={setDisplayingReport}
                        setMainVideoDescription={setMainVideoDescription}
                        report={report}
                      />
                    );
                  })
                ) : (
                  <h5>No reports available.</h5>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function BattleLogRow({
  index,
  battleLogs,
  reportKeys,
  tag,
  style,
}: RowComponentProps<{
  battleLogs: any[];
  reportKeys: Set<string>;
  tag: string;
}>) {
  const battlelog = battleLogs[index];
  const battleKey = battlelog?.battle?.teams
    ?.flat()
    ?.map((p: any) => p.tag)
    ?.sort()
    ?.join("-");
  const isReported = reportKeys.has(battleKey);

  return (
    <div style={style}>
      <BattleLogSoloRanked
        battleLog={battlelog}
        ownTag={tag}
        isReported={isReported}
      />
    </div>
  );
}

function rowHeight(index: number, { battleLogs }: any) {
  switch (battleLogs[index].rounds.length) {
    case 1:
      return 160;
    case 2:
      return 192;
    case 3:
      return 224;
    default:
      return 160;
  }
}
