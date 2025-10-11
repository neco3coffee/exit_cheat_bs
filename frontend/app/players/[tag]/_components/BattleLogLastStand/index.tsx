import Image from "next/image";
import { shortenMapName } from "@/app/_lib/common";
import { RelativeTime } from "@/app/_lib/time";
import { classifyModeByMapName } from "@/app/_lib/unknownMode";
import PlayerComponent from "@/app/players/[tag]/_components/PlayerComponent";
import styles from "./index.module.scss";

const BattleLogLastStand = ({ battleLog, ownTag }: any) => {
  const tag = ownTag.trim().toUpperCase().replace(/O/g, "0");
  const starPlayerTag = battleLog?.battle?.starPlayer?.tag;
  const mode =
    battleLog?.event?.mode !== "unknown"
      ? battleLog?.event.mode
      : classifyModeByMapName(battleLog?.event?.map);
  const level = battleLog?.battle?.level?.name;
  const result = battleLog?.battle?.result;

  console.log("battleLog: ", JSON.stringify(battleLog, null, 2));
  return (
    <div className={styles.container} data-testid="battleLog">
      <div className={styles.topContainer}>
        <div className={styles.left}></div>
        <h5>
          {battleLog.battle.type === "friendly"
            ? battleLog?.battle?.type?.toUpperCase()
            : ""}
        </h5>
        {battleLog?.battleTime && (
          <div className={`${styles.right} notranslate`}>
            <RelativeTime target={battleLog?.battleTime} />
          </div>
        )}
      </div>
      <div className={styles.middleContainer}>
        <div className={styles.left}>
          <Image
            src={`/modes/${mode}.png`}
            alt={battleLog?.event?.mode || "mode"}
            width={30}
            height={30}
          />
          <div className={styles.modeAndMapContainer}>
            {/* TODO:DADGEBALLじゃなくてDOGDEBRAWLって表示できるようにする */}
            <h5 className="notranslate">
              {battleLog?.event?.mode === "unknown"
                ? mode?.toUpperCase()
                : battleLog?.event?.mode?.toUpperCase()}
            </h5>
            <h6
              className="notranslate"
              style={{ WebkitTouchCallout: "none" } as React.CSSProperties}
            >
              {shortenMapName(battleLog?.event?.map)}
            </h6>
          </div>
        </div>
        <h5 className={result === "victory" ? styles.victory : styles.defeat}>
          {result === "victory" ? `CHALLENGE: ${level} CLEARED!` : `DEFEAT`}
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
            <div></div>
          )}
        </div>
      </div>
      <div className={styles.bottomContainer}>
        <div className={styles.bottomContainerInner}>
          {battleLog?.battle.players.map((player: any) => {
            return (
              <div className={styles.playerWrapper} key={player?.tag}>
                {
                  <PlayerComponent
                    key={player?.tag}
                    player={player}
                    starPlayerTag={starPlayerTag}
                    battleType={battleLog?.battle?.type}
                    isMe={player?.tag === `#${tag}`}
                  />
                }
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BattleLogLastStand;
