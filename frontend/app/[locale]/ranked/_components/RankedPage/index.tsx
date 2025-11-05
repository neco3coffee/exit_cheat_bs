import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loading from "../../loading";
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
  battleLogsTabContent,
  reportsTabContent,
}: {
  locale: string;
  recentReportComponent: React.ReactNode;
  battleLogsTabContent: React.ReactNode;
  reportsTabContent: React.ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: "ranked" });

  return (
    <div className={styles.container}>
      <Suspense fallback={<Loading />}>{recentReportComponent}</Suspense>
      <Tabs className="w-full" defaultValue="battleLogs">
        <TabsList className={styles.tabsList}>
          <TabsTrigger value="battleLogs" className={styles.tabTrigger}>
            {t("tabs.battleLog")}
          </TabsTrigger>
          <TabsTrigger value="reports" className={styles.tabTrigger}>
            {t("tabs.report")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="battleLogs">
          <Suspense fallback={<Loading />}>{battleLogsTabContent}</Suspense>
        </TabsContent>
        <TabsContent value="reports">
          <Suspense fallback={<Loading />}>{reportsTabContent}</Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
