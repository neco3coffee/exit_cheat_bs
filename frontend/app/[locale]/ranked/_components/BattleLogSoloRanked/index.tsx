import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import {
  appendToEightDigits,
  shortenMapName,
  shortenPlayerName,
} from "@/app/_lib/common";
import { Duration, RelativeTime } from "@/app/_lib/time";
import { classifyModeByMapName } from "@/app/_lib/unknownMode";
import ServerLocaleMessageProviderWrapper from "@/app/_messages/ServerLocaleMessageProviderWrapper";
import ReportButton from "../client/ReportButton";
import styles from "./index.module.scss";

export const ReportStatus = {
  reportNotClicked: "reportNotClicked",
  reportClicked: "reportClicked",
  reportedPlayerClicked: "reportedPlayerClicked",
  reportTypeSelected: "reportTypeSelected",
  videoSelected: "videoSelected",
  signedUrlGenerated: "signedUrlGenerated",
  videoUploading: "videoUploading",
  videoUploaded: "videoUploaded",
  reasonInputted: "reasonInputted",
  reportSubmitted: "reportSubmitted",
  error: "error",
};

const ReportType = {
  badRandom: "badRandom",
  griefPlay: "griefPlay",
  cheating: "cheating",
};

async function PlayerComponent({
  locale,
  player,
  starPlayerTag,
  battleType,
  isDuel,
  isMe,
  reportedPlayerTag,
}: any) {
  const shortenedName = shortenPlayerName(player?.name);
  const isStarPlayer = player?.tag === starPlayerTag;
  const hashRemovedPlayerTag = player?.tag?.startsWith("#")
    ? player?.tag.slice(1)
    : player?.tag;

  const isBot = hashRemovedPlayerTag && hashRemovedPlayerTag.length < 4;
  const href = isBot
    ? `/${locale}`
    : `/${locale}/players/${hashRemovedPlayerTag}`;

  const t = await getTranslations({ locale, namespace: "ranked" });

  return (
    <Link
      key={player?.tag}
      href={href}
      className={styles.playerContainer}
      data-testid="playerComponent"
    >
      {reportedPlayerTag === player?.tag && (
        <Image
          src="/reported_player.png"
          alt="reported player"
          width={24}
          height={24}
          sizes="24px"
          className={styles.reportedIcon}
        />
      )}
      {isStarPlayer && (
        <div className={`${styles.mvpContainer}  `}>STAR PLAYER</div>
      )}
      <div className={styles.brawlerContainer}>
        <Image
          src={`https://cdn.brawlify.com/brawlers/borderless/${isDuel ? player?.brawlers[0].id : player?.brawler?.id}.png`}
          alt={
            isDuel
              ? player?.brawlers[0].name
              : player?.brawler?.name || "brawler"
          }
          fill={true}
          sizes="42px"
        />
        <div className={styles.rank}>
          <Image
            src={`https://cdn.brawlify.com/ranked/tiered/${appendToEightDigits(58000000, player?.brawler?.trophies > 0 ? player?.brawler?.trophies - 1 : 0)}.png`}
            alt="rank"
            height={20}
            width={20}
            sizes="20px"
            style={{ height: "20px", width: "auto" }}
          />
        </div>
        <div className={styles.levelContainer}>
          <strong>LVL</strong>
          <h6>{player?.brawler?.power}</h6>
        </div>
      </div>
      <span>{shortenedName}</span>
    </Link>
  );
}

async function BattleLogSoloRanked({
  params,
  locale,
  battleLog,
  ownTag,
  isReported,
}: any) {
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
              style={{ height: "30px", width: "auto" }}
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
            <Suspense fallback={null}>
              <ServerLocaleMessageProviderWrapper params={params}>
                <ReportButton
                  locale={locale}
                  tag={tag}
                  battleLog={battleLog}
                  isReported={isReported}
                />
              </ServerLocaleMessageProviderWrapper>
            </Suspense>
          </div>
        </div>
        <div className={styles.bottomContainer}>
          <div className={styles.bottomContainerInner}>
            <div className={styles.teamContainer}>
              {ownTeam?.map((player: any) => {
                return (
                  <PlayerComponent
                    locale={locale}
                    key={player?.tag}
                    player={player}
                    starPlayerTag={starPlayerTag}
                    battleType={battleLog?.battle?.type}
                    isMe={player?.tag === `#${tag}`}
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
                    locale={locale}
                    key={player?.tag}
                    player={player}
                    starPlayerTag={starPlayerTag}
                    battleType={battleLog?.battle?.type}
                    isMe={player?.tag === `#${tag}`}
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
        <div style={{ backgroundColor: "var(--black)" }}></div>
      </div>
    </>
  );
}

export default BattleLogSoloRanked;

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
