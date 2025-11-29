import { Bot, CircleCheck, CircleX, Clock, FileSearch } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { shortenMapName } from "@/app/_lib/common";
import { Duration, RelativeTime } from "@/app/_lib/time";
import { classifyModeByMapName } from "@/app/_lib/unknownMode";
import PlayerComponent from "@/app/[locale]/ranked/_components/PlayerComponent";
import { Textarea } from "@/components/ui/textarea";
import { ApproveButton, RejectButton } from "./_components/client/Button";
import styles from "./index.module.scss";

const _ReportType = {
  badRandom: "badRandom",
  griefPlay: "griefPlay",
  cheating: "cheating",
};

const StatusType = {
  created: "created",
  reported_player_selected: "reported_player_selected",
  report_type_selected: "report_type_selected",
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
      ? battleLog?.event?.mode
      : classifyModeByMapName(battleLog?.event?.map);
  const mapId = battleLog?.event?.id;
  const mythic1 = 12; // diamond1 = 9,mythic1 = 12, legendary1 = 15, master1 = 18, pro = 21
  const existAtLeastMythic1 = battleLog?.battle?.teams
    .flat()
    .some((player: any) => {
      return (
        player?.brawler?.trophies - 1 >= mythic1 &&
        player?.brawler?.trophies <= 21
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
          <Link
            href={`/${locale}/reports/${reportId}`}
            className={`${styles.statusContainer}
              ${
                status === "approved"
                  ? styles.statusApproved
                  : status === "rejected"
                    ? styles.statusRejected
                    : status === "waiting_review" || status === "videoOptimized"
                      ? styles.statusReview
                      : styles.statusPending
              }
            `}
          >
            {t(StatusType[status as keyof typeof StatusType])}
            {StatusIcon[status as keyof typeof StatusIcon]}
          </Link>
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
                <div className={styles.right}></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
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
