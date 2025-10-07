export const formatBattleLog = (battleLogs: any[]) => {
  const formattedBattleLogs: any[] = [];
  battleLogs.forEach((battleLog: any) => {
    if (battleLog.battle.type === "soloRanked") {
      const existingBattle = formattedBattleLogs.find((b) => {
        if (!b?.battle?.teams) {
          return false;
        }

        const beforeBattleLogId = b.battle.teams
          .flat()
          .map((player: any) => player.tag)
          .sort()
          .join("-");
        const currentBattleLogId = battleLog.battle.teams
          .flat()
          .map((player: any) => player.tag)
          .sort()
          .join("-");
        return beforeBattleLogId === currentBattleLogId;
      });
      const roundData = {
        battleTime: battleLog.battleTime,
        result: battleLog.battle.result,
        duration: battleLog.battle.duration,
      };
      if (existingBattle) {
        existingBattle.rounds.push(roundData);
        existingBattle.rounds.sort((a: any, b: any) =>
          a.battleTime.localeCompare(b.battleTime),
        );
      } else {
        battleLog.rounds = [roundData];
        formattedBattleLogs.push(battleLog);
      }
    } else {
      formattedBattleLogs.push(battleLog);
    }
  });
  return formattedBattleLogs;
};
