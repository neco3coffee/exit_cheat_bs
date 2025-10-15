"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatBattleLog } from "@/app/_lib/formatBattleLog";
import BattleLogSoloRanked from "@/app/ranked/_components/BattleLogSoloRanked";
import ReportedBattleLogSoloRanked from "@/app/ranked/_components/ReportedBattleLogSoloRanked";
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
}

export default function RankedPage() {
  const [status, setStatus] = useState(Status.Idle);
  const [player, setPlayer] = useState<Player | null>(null);
  const [battleLogs, setBattleLogs] = useState<any[] | null>(null);
  const [reports, setReports] = useState<any[] | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [approvedReports, setApprovedReports] = useState<any[]>([]);

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
    if (selectedReport && selectedReport.video_url) {
      setVideoUrl(selectedReport.video_url);
    }
  }, [approvedReports]);

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
        <p>Error occurred. Please try again later.</p>
      )}
      {status === Status.Unauthenticated && (
        <>
          <h1>Ranked Page</h1>
          <p>To access this page, you need to login!</p>
          <Link className={styles.login} href="/account">
            Login
          </Link>
        </>
      )}
      {status === Status.Authenticated && (
        <>
          <div className={styles.recentVideoContainer} ref={topRef}>
            {videoUrl && (
              <video key={videoUrl} autoPlay loop src={videoUrl}>
                <track kind="captions" src={videoUrl} label="No captions" />
              </video>
            )}
          </div>
          <Tabs defaultValue="battlelogs" className="w-full">
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="review" className={styles.tabTrigger}>
                review
              </TabsTrigger>
              <TabsTrigger value="battlelogs" className={styles.tabTrigger}>
                Battle Logs
              </TabsTrigger>
              <TabsTrigger value="reports" className={styles.tabTrigger}>
                Reports
              </TabsTrigger>
            </TabsList>
            <TabsContent value="review">
              <div className={styles.reviewContainer}>
                <h5>Only moderator can review, approve, reject reports!</h5>
              </div>
            </TabsContent>
            <TabsContent value="battlelogs">
              <div className={styles.battlelogContainer}>
                {battleLogs &&
                  battleLogs.map((battlelog, index) => {
                    const tag = player?.tag.startsWith("#")
                      ? player?.tag.substring(1)
                      : player?.tag;
                    const isReported = reports?.some(
                      (report) =>
                        report?.battle_data?.battle?.teams
                          .flat()
                          .map((p: any) => p.tag)
                          .sort()
                          .join("-") ===
                        battlelog?.battle?.teams
                          .flat()
                          .map((p: any) => p.tag)
                          .sort()
                          .join("-"),
                    );
                    return (
                      <BattleLogSoloRanked
                        key={`${battlelog.battleTime}-${index}`}
                        battleLog={battlelog}
                        ownTag={tag}
                        isReported={isReported}
                      />
                    );
                  })}
                {!battleLogs ||
                  (battleLogs?.length === 0 && (
                    <h5>No ranked battle logs available.</h5>
                  ))}
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

                    console.log("Rendering report:", report);
                    console.log("Battle log:", battleLog);
                    console.log("Own tag:", ownTag);

                    return (
                      <ReportedBattleLogSoloRanked
                        key={`report-${report.id}`}
                        battleLog={battleLog}
                        ownTag={ownTag}
                        status={report.status}
                        reported_tag={report.reported_tag}
                        video_url={report.video_url}
                        setVideoUrl={setVideo}
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
