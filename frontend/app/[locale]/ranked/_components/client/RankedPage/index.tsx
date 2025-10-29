"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { List, type RowComponentProps } from "react-window";
import BattleLogSoloRanked from "@/app/[locale]/ranked/_components/BattleLogSoloRanked";
import ReportedBattleLogSoloRanked from "@/app/[locale]/ranked/_components/ReportedBattleLogSoloRanked";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import styles from "./index.module.scss";

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

export default function RankedPage({
  player,
  battleLogs,
  reports,
  recentReport,
  waitingReviewReports,
}: {
  player: Player;
  battleLogs: any[];
  reports: any[];
  recentReport: any;
  waitingReviewReports: any[];
}) {
  const t = useTranslations("ranked");
  const topRef = useRef<HTMLDivElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(
    recentReport?.video_url || null,
  );
  const [displayingReport, setDisplayingReport] = useState<any>(
    recentReport || null,
  );
  const [mainVideoDescription, setMainVideoDescription] = useState<string>(
    t("mainVideoDescription"),
  );
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

  const setVideo = (url: string | null) => {
    setVideoUrl(url);
    setIsPaused(true);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={styles.container}>
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
              sizes="64px"
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
            }
            {
              <p>
                {
                  displayingReport.battle_data.battle.teams
                    .flat()
                    .find((p: any) => p.tag === displayingReport.reported_tag)
                    .name
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
              <h5>{t("noBattleLog")}</h5>
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
              <h5>{t("noReport")}</h5>
            )}
          </div>
        </TabsContent>
      </Tabs>
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
