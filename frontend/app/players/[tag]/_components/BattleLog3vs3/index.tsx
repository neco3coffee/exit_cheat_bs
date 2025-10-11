import Image from "next/image";
import { shortenMapName } from "@/app/_lib/common";
import { Duration, RelativeTime } from "@/app/_lib/time";
import { classifyModeByMapName } from "@/app/_lib/unknownMode";
import PlayerComponent from "@/app/players/[tag]/_components/PlayerComponent";
import styles from "./index.module.scss";

const BattleLog3vs3 = ({ battleLog, ownTag }: any) => {
  const tag = ownTag.trim().toUpperCase().replace(/O/g, "0");
  console.log("tag: ", tag);
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
        <h5
          className={
            battleLog?.battle?.result === "victory"
              ? styles.victory
              : battleLog?.battle?.result === "defeat"
                ? styles.defeat
                : styles.draw
          }
        >
          {battleLog?.battle?.result?.toUpperCase()}
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
            ""
          )}
        </div>
      </div>
      <div className={styles.bottomContainer}>
        <div className={styles.bottomContainerInner}>
          <div className={styles.teamContainer}>
            {ownTeam?.map((player: any) => {
              return (
                <PlayerComponent
                  key={player?.tag}
                  player={player}
                  starPlayerTag={starPlayerTag}
                  battleType={battleLog?.battle?.type}
                  isMe={player.tag === `#${tag}`}
                />
              );
            })}
          </div>
          <div className={styles.vsContainer}>
            <strong className="notranslate">VS</strong>
            <Duration seconds={battleLog?.battle.duration} />
          </div>
          <div className={styles.teamContainer}>
            {enemyTeam?.map((player: any) => {
              return (
                <PlayerComponent
                  key={player?.tag}
                  player={player}
                  starPlayerTag={starPlayerTag}
                  battleType={battleLog?.battle?.type}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleLog3vs3;
