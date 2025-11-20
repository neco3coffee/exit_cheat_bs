// Server Component
import { Bot, CircleCheck, CircleX, Clock, FileSearch } from "lucide-react";
import { cookies } from "next/headers";
import { Suspense } from "react";
import ServerLocaleMessageProviderWrapper from "@/app/_messages/ServerLocaleMessageProviderWrapper";
import Loading from "@/app/[locale]/ranked/loading";
import { RecentVideoComponent } from "@/app/[locale]/ranked/page";
import ReportCreateView from "@/app/[locale]/reports/[id]/_components/client/ReportCreateView";
import ReportDetailView from "../client/ReportDetailView";
import styles from "./index.module.scss";

const StatusType = {
  created: "created",
  signed_url_generated: "signed_url_generated",
  info_and_video_updated: "info_and_video_updated",
  video_optimized: "video_optimized",
  waiting_review: "waiting_review",
  approved: "approved",
  rejected: "rejected",
  appealed: "appealed",
};

const StatusIcon = {
  created: <Clock className={styles.statusIconPending} />,
  signed_url_generated: <Clock className={styles.statusIconPending} />,
  info_and_video_updated: <Bot className={styles.statusIconPending} />,
  video_optimized: <FileSearch className={styles.statusIconPending} />,
  waiting_review: <FileSearch className={styles.statusIconReview} />,
  approved: <CircleCheck className={styles.statusIconApproved} />,
  rejected: <CircleX className={styles.statusIconRejected} />,
};

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://app:3000";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session_token")?.value || null;
  // reportIdでAPIからReportデータを取得する
  const res = await fetch(`${apiUrl}/api/v1/reports/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `session_token=${sessionCookie}`,
    },
    // cookieを含める
    credentials: "include",
  });
  const { report, player_role, player_tag } = await res.json();

  // statusがcreatedの場合は,reported_tagのプレイヤー選択UI->report_type選択UI->videoアップロード+報告理由入力のUIの順で表示
  if (
    report.status === StatusType.created ||
    report.status === StatusType.signed_url_generated
  ) {
    return (
      <Suspense fallback={<Loading />}>
        <ServerLocaleMessageProviderWrapper params={params}>
          <ReportCreateView report={report} locale={locale} />
        </ServerLocaleMessageProviderWrapper>
      </Suspense>
    );
  }

  // statusが info_and_video_uploaded | waiting_review | approved | rejected でsession player=reporter_tagの場合は、報告の詳細情報を表示するUIを表示
  if (
    report.status === StatusType.info_and_video_updated ||
    report.status === StatusType.video_optimized ||
    report.status === StatusType.waiting_review ||
    report.status === StatusType.approved ||
    report.status === StatusType.rejected
  ) {
    if (player_tag === report.reporter_tag) {
      return (
        <Suspense fallback={<Loading />}>
          <ServerLocaleMessageProviderWrapper params={params}>
            <ReportDetailView report={report} locale={locale} />
          </ServerLocaleMessageProviderWrapper>
        </Suspense>
      );
    }
  }

  // statusが approved で session playerが reported_tagと一致する場合は、報告を取り下げる申請UIを表示 (appeal_comment入力欄 + 取り下げ申請ボタン)
  // TODO: 報告されたプレイヤーが異議申し立てをできるようにする
  if (
    report.status === StatusType.approved &&
    player_tag === report.reported_tag
  ) {
    return (
      <></>
      // <ReportAppealView />
    );
  }
  return <></>;
}
