import styles from "./index.module.scss";
import { RelativeTime, Duration } from "@/app/players/[tag]/_lib/time";
import Image from "next/image";
import { classifyModeByMapName } from "@/app/players/[tag]/_lib/unknownMode";
import { shortenMapName } from "@/app/players/[tag]/_lib/common";
import PlayerComponent from "@/app/players/[tag]/_components/PlayerComponent";
import { TriangleAlert } from "lucide-react";

const BattleLogSoloRanked = ({ battleLog, ownTag }: any) => {
  const ownTeam = battleLog?.battle?.teams.find((team: any) => {
    return team.some((player: any) => player.tag === `#${ownTag}`);
  });
  const enemyTeam = battleLog?.battle?.teams.find((team: any) => {
    return team.every((player: any) => player.tag !== `#${ownTag}`);
  });
  const starPlayerTag = battleLog?.battle?.starPlayer?.tag;
  const mode =
    battleLog?.event?.mode !== "unknown"
      ? battleLog?.event.mode
      : classifyModeByMapName(battleLog?.event?.map);

  return (
    <div className={styles.container}>
      <div className={styles.topContainer}>
        <div className={styles.left}></div>
        <h5>
          {battleLog.battle.type === "friendly"
            ? battleLog.battle.type.toUpperCase()
            : ""}
        </h5>
        {battleLog?.battleTime && (
          <div className={styles.right}>
            <RelativeTime target={battleLog?.battleTime} />
          </div>
        )}
      </div>
      <div className={styles.middleContainer}>
        <div className={styles.left}>
          <Image
            src={`/modes/${mode}.png`}
            alt={battleLog?.event?.mode}
            width={30}
            height={30}
          />
          <div className={styles.modeAndMapContainer}>
            {/* TODO:DADGEBALLじゃなくてDOGDEBRAWLって表示できるようにする */}
            <h5>
              {battleLog?.event?.mode === "unknown"
                ? mode.toUpperCase()
                : battleLog?.event.mode.toUpperCase()}
            </h5>
            <h6>{shortenMapName(battleLog?.event?.map)}</h6>
          </div>
        </div>
        <h5
          className={
            battleLog?.battle?.result === "victory"
              ? styles.victory
              : styles.defeat
          }
        >
          {battleLog?.battle?.result.toUpperCase()}
        </h5>
        <div className={styles.right}>
          {battleLog?.battle.type === "ranked" &&
          battleLog?.battle?.trophyChange ? (
            <>
              {battleLog?.battle?.trophyChange > 0
                ? `+${battleLog?.battle?.trophyChange}`
                : battleLog?.battle?.trophyChange}
              <Image
                src="/icon_trophy1.png"
                alt="trophy icon"
                width={15}
                height={15}
              />
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className={styles.bottomContainer}>
        <div className={styles.bottomContainerInner}>
          <div className={styles.teamContainer}>
            {ownTeam?.map((player: any) => {
              return PlayerComponent(
                player,
                starPlayerTag,
                battleLog?.battle?.type,
              );
            })}
          </div>
          <div className={styles.vsContainer}>
            <strong>VS</strong>
            <Duration seconds={battleLog?.battle.duration} />
          </div>
          <div className={styles.teamContainer}>
            {enemyTeam?.map((player: any) => {
              return PlayerComponent(
                player,
                starPlayerTag,
                battleLog?.battle?.type,
              );
            })}
          </div>
        </div>
        <div className={styles.roundsContainer}>
          {battleLog?.rounds?.map((round: any, index: number) => {
            return (
              <div key={index} className={styles.roundContainer}>
                <div className={styles.left}>
                  <h6>ROUND {index + 1}</h6>
                  <Duration seconds={round?.duration} />
                </div>
                <h5
                  className={
                    round.result === "victory" ? styles.victory : styles.defeat
                  }
                >
                  {round.result.toUpperCase()}
                </h5>
                <div className={styles.right}>
                  <button className={styles.reportButton}>
                    REPORT <TriangleAlert className={styles.icon} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BattleLogSoloRanked;
