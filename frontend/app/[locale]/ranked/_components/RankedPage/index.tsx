import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Link } from "@/app/_messages/i18n/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loading from "../../loading";
import BattleLogAutoSaveIconToggle from "../client/BattleLogAutoSaveToggle";
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
  auto_save_enabled?: boolean | null;
  auto_save_expires_at?: string | null;
}

export default async function RankedPage({
  locale,
  player,
  recentReportComponent,
  battleLogsTabContent,
  reportsTabContent,
}: {
  locale: string;
  player: Player;
  recentReportComponent: React.ReactNode;
  battleLogsTabContent: React.ReactNode;
  reportsTabContent: React.ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: "ranked" });

  return (
    <div className={styles.container}>
      <Suspense fallback={<Loading />}>{recentReportComponent}</Suspense>
      {/* auto save radar icon and expire time */}
      <BattleLogAutoSaveIconToggle
        expiresAt={player.auto_save_expires_at || null}
        defaultEnabled={player.auto_save_enabled || false}
      />

      <Tabs className="w-full" defaultValue="battleLogs">
        <TabsList className={styles.tabsList}>
          <Link href={`/ranked/stats`} className={styles.tabTrigger}>
            📊
          </Link>
          <TabsTrigger value="battleLogs" className={styles.tabTrigger}>
            ⚔️
          </TabsTrigger>
          <TabsTrigger value="reports" className={styles.tabTrigger}>
            ⚠️
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
