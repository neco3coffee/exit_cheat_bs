import Image from "next/image";
import PlayerComponent from "@/app/players/[tag]/_components/PlayerComponent";
import { shortenMapName } from "@/app/players/[tag]/_lib/common";
import { RelativeTime } from "@/app/players/[tag]/_lib/time";
import { classifyModeByMapName } from "@/app/players/[tag]/_lib/unknownMode";
import styles from "./index.module.scss";

const BattleLogDuo = ({ battleLog }: any) => {
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
            battleLog?.battle?.rank < 4 ? styles.victory : styles.defeat
          }
        >{`RANK ${battleLog?.battle?.rank}`}</h5>
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
            <div></div>
          )}
        </div>
      </div>
      <div className={styles.bottomContainer}>
        <div className={styles.bottomContainerInner}>
          {battleLog?.battle.teams.map((team: any, _index: number) => {
            return (
              <div
                className={styles.teamContainer}
                key={team.map((p: any) => p?.tag).join("-")}
              >
                {team.map((player: any, index: number) => {
                  if (index === 0) {
                    return (
                      <div key={player?.tag} className={styles.firstPlayer}>
                        {PlayerComponent(
                          player,
                          starPlayerTag,
                          battleLog?.battle?.type,
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div key={player?.tag}>
                        {PlayerComponent(
                          player,
                          starPlayerTag,
                          battleLog?.battle?.type,
                        )}
                      </div>
                    );
                  }
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BattleLogDuo;
