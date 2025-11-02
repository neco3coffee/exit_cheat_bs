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
  recentReportComponent,
  reviewTabContent,
  battleLogsTabContent,
  reportsTabContent,
}: {
  locale: string;
  recentReportComponent: React.ReactNode;
  reviewTabContent: React.ReactNode;
  battleLogsTabContent: React.ReactNode;
  reportsTabContent: React.ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: "ranked" });

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
        <TabsContent value="battleLogs">{battleLogsTabContent}</TabsContent>
        <TabsContent value="reports">{reportsTabContent}</TabsContent>
      </Tabs>
    </div>
  );
}
