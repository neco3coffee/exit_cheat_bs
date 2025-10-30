import { CircleCheck, CircleX, Clock, FileSearch, Tv } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { shortenMapName } from "@/app/_lib/common";
import { Duration, RelativeTime } from "@/app/_lib/time";
import { classifyModeByMapName } from "@/app/_lib/unknownMode";
import PlayerComponent from "@/app/[locale]/ranked/_components/PlayerComponent";
import { Textarea } from "@/components/ui/textarea";
import {
  ApproveButton,
  RejectButton,
  ReplayButton,
} from "./_components/client/Button";
import styles from "./index.module.scss";

const ReportType = {
  badRandom: "badRandom",
  griefPlay: "griefPlay",
  cheating: "cheating",
};

const StatusType = {
  pending: "pending",
  waiting_review: "waitingReview",
  approved: "approved",
  rejected: "rejected",
};

const StatusIcon = {
  pending: <Clock className={styles.statusIconPending} />,
  waiting_review: <FileSearch className={styles.statusIconReview} />,
  approved: <CircleCheck className={styles.statusIconApproved} />,
  rejected: <CircleX className={styles.statusIconRejected} />,
};

export default async function ReportedBattleLogSoloRanked({
  locale,
  battleLog,
  ownTag,
  status,
  reported_tag,
  video_url,
  reason,
  reportId,
  report,
}: {
  locale: string;
  battleLog: any;
  ownTag: string;
  status: string;
  reported_tag: string;
  video_url: string | null;
  reason?: string;
  reportId?: string;
  report?: any;
}) {
  const tag = ownTag.trim().toUpperCase().replace(/O/g, "0");
  const ownTeam = battleLog?.battle?.teams.find((team: any) => {
    return team.some((player: any) => player.tag === `#${tag}`);
  });
  const enemyTeam = battleLog?.battle?.teams.find((team: any) => {
    return team.every((player: any) => player.tag !== `#${tag}`);
  });
  const starPlayerTag = battleLog?.battle?.starPlayer?.tag;
  const mode =
    battleLog?.event?.mode !== "unknown"
      ? battleLog?.event.mode
      : classifyModeByMapName(battleLog?.event?.map);
  const mapId = battleLog?.event?.id;
  const mythic1 = 12; // diamond1 = 9,mythic1 = 12, legendary1 = 15, master1 = 18, pro = 21
  const existAtLeastMythic1 = battleLog?.battle?.teams
    .flat()
    .some((player: any) => {
      return (
        player?.brawler?.trophies >= mythic1 && player?.brawler?.trophies <= 21
      ); // pro = 21
    });
  let result = null;
  if (existAtLeastMythic1) {
    result = getResult(battleLog?.rounds);
  } else {
    result = battleLog?.battle?.result;
  }
  const t = await getTranslations({ locale, namespace: "ranked" });

  return (
    <>
      <div className={styles.container} data-testid="battleLog">
        <div className={styles.topContainer}>
          <div className={styles.left}></div>
          <h5>
            {battleLog?.battle?.type === "friendly"
              ? battleLog?.battle?.type?.toUpperCase()
              : ""}
          </h5>
          {battleLog?.battleTime && (
            <div className={`${styles.right}  `}>
              <RelativeTime target={battleLog?.battleTime} />
            </div>
          )}
        </div>
        <div className={styles.middleContainer}>
          <Link className={styles.left} href={`/${locale}/maps/${mapId}`}>
            <Image
              src={`/modes/${mode}.png`}
              alt={battleLog?.event?.mode || "mode"}
              width={30}
              height={30}
              sizes="30px"
            />
            <div className={styles.modeAndMapContainer}>
              {/* TODO:DADGEBALLじゃなくてDOGDEBRAWLって表示できるようにする */}
              <h5>
                {battleLog?.event?.mode === "unknown"
                  ? mode?.toUpperCase()
                  : battleLog?.event?.mode?.toUpperCase()}
              </h5>
              <h6 style={{ WebkitTouchCallout: "none" } as React.CSSProperties}>
                {shortenMapName(battleLog?.event?.map)}
              </h6>
            </div>
          </Link>
          <h5
            className={
              result === "victory"
                ? styles.victory
                : result === "defeat"
                  ? styles.defeat
                  : result === "ongoing"
                    ? styles.ongoing
                    : styles.draw
            }
          >
            {t(result)}
          </h5>
          <div className={styles.right}>
            <div
              className={`${styles.statusContainer}
              ${
                status === "approved"
                  ? styles.statusApproved
                  : status === "rejected"
                    ? styles.statusRejected
                    : status === "waiting_review"
                      ? styles.statusReview
                      : styles.statusPending
              }
            `}
            >
              {t(StatusType[status as keyof typeof StatusType])}
              {StatusIcon[status as keyof typeof StatusIcon]}
            </div>
          </div>
        </div>
        <div className={styles.bottomContainer}>
          <div className={styles.bottomContainerInner}>
            <div className={styles.teamContainer}>
              {ownTeam?.map((player: any) => {
                return (
                  <PlayerComponent
                    key={player?.tag}
                    locale={locale}
                    player={player}
                    starPlayerTag={starPlayerTag}
                    battleType={battleLog?.battle?.type}
                    isMe={player?.tag === `#${tag}`}
                    reportedPlayerTag={reported_tag}
                  />
                );
              })}
            </div>
            <div className={styles.vsContainer}>
              <strong>VS</strong>
            </div>
            <div className={styles.teamContainer}>
              {enemyTeam?.map((player: any) => {
                return (
                  <PlayerComponent
                    key={player?.tag}
                    locale={locale}
                    player={player}
                    starPlayerTag={starPlayerTag}
                    battleType={battleLog?.battle?.type}
                    reportedPlayerTag={reported_tag}
                  />
                );
              })}
            </div>
          </div>
          <div className={styles.roundsContainer}>
            {battleLog?.rounds?.map((round: any, index: number) => {
              return (
                <div
                  key={`${index}-${round.duration}`}
                  className={styles.roundContainer}
                >
                  <div className={styles.left}>
                    <h6>ROUND {index + 1}</h6>
                    <Duration seconds={round?.duration} />
                  </div>
                  <h5
                    className={
                      round.result === "victory"
                        ? styles.victory
                        : round.result === "defeat"
                          ? styles.defeat
                          : styles.draw
                    }
                  >
                    {t(round?.result)}
                  </h5>
                  <div className={styles.right}>
                    {index === 0 && (
                      <ReplayButton
                        video_url={video_url}
                        replay={t("replay")}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {reportId && (
          <div className={styles.reviewContainer}>
            <Textarea
              rows={6}
              value={reason}
              placeholder="Type your reason here."
              id="reason"
              disabled
              style={{
                backgroundColor: "var(--blue-black)",
                color: "var(--white)",
                padding: "8px",
              }}
            />
            <div className={styles.buttonContainer}>
              <RejectButton
                reportId={reportId}
                reportIdMissing={t("reportIdMissing")}
                reportRejected={t("reportRejected")}
                failedReject={t("failedReject")}
                errorReject={t("errorReject")}
                reject={t("reject")}
              />
              <ApproveButton
                reportId={reportId}
                reportIdMissing={t("reportIdMissing")}
                reportApproved={t("reportApproved")}
                failedApprove={t("failedApprove")}
                errorApprove={t("errorApprove")}
                approve={t("approve")}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const getResult = (rounds: any[]) => {
  const victoryCount = rounds.filter(
    (round) => round.result === "victory",
  ).length;
  const defeatCount = rounds.filter(
    (round) => round.result === "defeat",
  ).length;

  if (victoryCount >= 2) return "victory";
  if (defeatCount >= 2) return "defeat";
  if (rounds.length < 3) return "ongoing";
  return "draw";
};
