"use client";

// TODO: use clientを外してvideoとタブの中身をserver component化する
import { useTranslations } from "next-intl";
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
  waitingReviewReports,
  recentReportComponent,
}: {
  player: Player;
  battleLogs: any[];
  reports: any[];
  waitingReviewReports: any[];
  recentReportComponent: React.ReactNode;
}) {
  const t = useTranslations("ranked");

  const reportKeys = new Set(
    reports?.map((r) =>
      r?.battle_data?.battle?.teams
        .flat()
        .map((p: any) => p.tag)
        .sort()
        .join("-"),
    ) || [],
  );

  const tag = player?.tag?.startsWith("#")
    ? player.tag.substring(1)!
    : player?.tag!;

  return (
    <div className={styles.container}>
      {recentReportComponent}
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
                      reason={report.reason}
                      reportId={report.id}
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
                rowProps={{ battleLogs, reportKeys, tag }}
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
