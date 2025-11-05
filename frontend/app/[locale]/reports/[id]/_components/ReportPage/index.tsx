// Server Component

import { cookies } from "next/headers";
import styles from "./index.module.scss";

const apiUrl = "http://app:3000";

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

  // statusが info_and_video_uploaded | waiting_review | approved | rejected でsession player=reporter_tagの場合は、報告の詳細情報を表示するUIを表示

  // statusが waiting_review で session player !== reporter_tag かつ session player = moderator | adminの場合は、レビュー用UIを表示 (approve/rejectボタン + コメント入力欄)

  // statusが approved で session playerが reported_tagと一致する場合は、報告を取り下げる申請UIを表示 (appeal_comment入力欄 + 取り下げ申請ボタン)

  return (
    <>
      report page <br />
      {locale}
      <br />
      {/* json stringifyでreportを表示 */}
      <pre>{JSON.stringify(report, null, 2)}</pre>
      <p>player_role: {player_role}</p>
      <p>player_tag: {player_tag}</p>
    </>
  );
}
