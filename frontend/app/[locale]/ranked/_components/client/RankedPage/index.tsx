import { getTranslations } from "next-intl/server";
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

export default async function RankedPage({
  locale,
  player,
  battleLogs,
  reports,
  recentReportComponent,
  reviewTabContent,
}: {
  locale: string;
  player: Player;
  battleLogs: any[];
  reports: any[];
  recentReportComponent: React.ReactNode;
  reviewTabContent: React.ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: "ranked" });

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
        <TabsContent value="review">{reviewTabContent}</TabsContent>
        <TabsContent value="battleLogs">
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
                    key={`${battleKey}-${battleLog?.battleTime}`}
                    battleLog={battlelog}
                    ownTag={tag}
                    isReported={isReported}
                  />
                );
              })
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
                    locale={locale}
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
