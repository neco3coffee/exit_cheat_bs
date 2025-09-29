import styles from './page.module.scss';
import Image from 'next/image';
import Record from '@/app/_components/Record'
import BattleLogSoloRanked from '@/app/players/[tag]/_components/BattleLogSoloRanked'
import BattleLog3vs3 from '@/app/players/[tag]/_components/BattleLog3vs3'
import BattleLog5vs5 from '@/app/players/[tag]/_components/BattleLog5vs5'
import BattleLogTrio from '@/app/players/[tag]/_components/BattleLogTrio'
import BattleLogDuo from '@/app/players/[tag]/_components/BattleLogDuo'
import BattleLogSolo from '@/app/players/[tag]/_components/BattleLogSolo'
import BattleLogDuel from '@/app/players/[tag]/_components/BattleLogDuel'
import { appendToEightDigits } from '@/app/players/[tag]/_lib/common'

type Player = {
  tag: string
  name: string
  nameColor: string
  iconId: number
  currentRank: number
  trophies: number
  highestTrophies: number
  vs3Victories: number
  soloVictories: number
  club: {
    tag: string
    name: string
    badgeId: number
  },
  battlelog: any
}

export default async function Page({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag } = await params;
  console.log("tag: ", tag);

  const res = await fetch(`http://app:3000/api/v1/players/${encodeURIComponent(tag)}`);
  // console.log(`res: ${res.status} - ${res.body}`)
  const player: Player = await res.json();
  // console.log("player data: ", JSON.stringify(player, null, 2));

  const battleLogs = formatBattleLog(player.battlelog?.items || []);
  // console.log("battleLogs: ", JSON.stringify(battleLogs, null, 2));


  return (
    <>
      <div className={styles.container}>
        {/* プレイヤー基本情報 */}
        <div className={styles.basicInfoContainer}>
          <div className={styles.iconContainer}>
            <Image
              src={`https://cdn.brawlify.com/profile-icons/regular/${player.iconId}.png`}
              alt="icon"
              width={80}
              height={80}
            />
            <h3>{player.tag}</h3>
          </div>
          <div className={styles.nameAndRankContainer}>
            <h1 style={{ color: `#${player?.nameColor?.replace(/^0x/,"").slice(2)}`}}>{player.name}</h1>
            {player.currentRank &&
              <Image
                src={`https://cdn.brawlify.com/ranked/tiered/${appendToEightDigits(58000000, player.currentRank)}.png`}
                alt="rank"
                height={60}
                width={60}
                style={{ height: "60px", width: "auto" }}
              />
            }
          </div>
        </div>
        <div className={styles.recordsContainer}>
          <Record label='シーズン記録' imagePath='/icon_trophy1.png' value={player.trophies} />
          <Record label='最多トロフィー数' imagePath='/icon_trophy1.png' value={player.highestTrophies} />
          <Record label='3対3勝利数' imagePath='/3vs3.png' value={player.vs3Victories} />
          <Record label='勝利数' imagePath='https://cdn.brawlify.com/game-modes/regular/48000006.png' value={player.soloVictories} />
        </div>
        <div className={styles.clubContainer}>
          {
            player?.club?.badgeId ?
              <Image
                src={`https://cdn.brawlify.com/club-badges/regular/${player.club.badgeId}.png`}
                alt=''
                width={32}
                height={36}
              />
            : <div>?</div>
          }
          <div className={styles.clubNameContainer}>
            {/* TODO: <c*> <c/> で*に0,2,3,4,5,6,7,8,9 が来る場合にゲーム内で色が変わる、クラブ検索から色は調べられる */}
            {player?.club?.name}
          </div>
        </div>

        {/* バトル履歴 */}
        <div className={styles.battlelogContainer}>
          <h2>バトル履歴</h2>
          {
            battleLogs.map((battleLog, index) => {
              if (battleLog.rounds) {
                console.log("battleLogsss: ", JSON.stringify(battleLog, null, 2));
                return (
                  <BattleLogSoloRanked key={index} battleLog={battleLog} ownTag={tag} />
                )
              } else if (battleLog.battle.teams && battleLog.battle.teams.length === 2 && battleLog.battle.teams[0].length === 3) {
                return (
                  <BattleLog3vs3 key={index} battleLog={battleLog} ownTag={tag} />
                )
              } else if (battleLog.battle.teams && battleLog.battle.teams.length === 2 && battleLog.battle.teams[0].length === 5) {
                return (
                  <BattleLog5vs5 key={index} battleLog={battleLog} ownTag={tag} />
                )
              } else if (battleLog.battle.teams && battleLog.battle.teams.length === 4) {
                return (
                  <BattleLogTrio key={index} battleLog={battleLog} ownTag={tag} />
                )
              } else if (battleLog.battle.teams && battleLog.battle.teams.length === 5) {
                return (
                  <BattleLogDuo key={index} battleLog={battleLog} ownTag={tag} />
                )
              } else if (battleLog.battle.players && battleLog.battle.players.length > 2) {
                return (
                  <BattleLogSolo key={index} battleLog={battleLog} ownTag={tag} />
                )
              } else if (battleLog.battle.players && battleLog.battle.players.length === 2) {
                return (
                  <BattleLogDuel key={index} battleLog={battleLog} ownTag={tag} />
                )
              } else {
                return (
                  <div key={index}>不明なバトル形式</div>
                )
              }
            })
          }
        </div>
      </div>
    </>
  )
}

const formatBattleLog = (battleLogs: any[]) => {
  const formattedBattleLogs: any[] = [];
  battleLogs.forEach((battleLog: any) => {
    if (battleLog.battle.type === 'soloRanked') {
      const existingBattle = formattedBattleLogs.find((b) => {
        if (!b?.battle?.teams) {
          return false
        }

        const beforeBattleLogId = b.battle.teams.flat().map((player: any) => player.tag).sort().join('-');
        const currentBattleLogId = battleLog.battle.teams.flat().map((player: any) => player.tag).sort().join('-');
        return beforeBattleLogId === currentBattleLogId
      })
      const roundData = {
        battleTime: battleLog.battleTime,
        result: battleLog.battle.result,
        duration: battleLog.battle.duration
      };
      if (existingBattle) {
        existingBattle.rounds.push(roundData);
        existingBattle.rounds.sort((a: any, b: any) => a.battleTime.localeCompare(b.battleTime))
      } else {
        battleLog.rounds = [roundData];
        formattedBattleLogs.push(battleLog);
      }
    } else {
      formattedBattleLogs.push(battleLog);
    }
  })
  // console.log("formattedBattleLogs: ", JSON.stringify(formattedBattleLogs, null, 2));
  return formattedBattleLogs
}
