import { cacheLife } from "next/cache";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import Loading from "@/app/_components/Loading";
import ServerLocaleMessageProviderWrapper from "@/app/_messages/ServerLocaleMessageProviderWrapper";
import BattleLogSoloRanked from "@/app/[locale]/(public)/players/[tag]/_components/BattleLogSoloRanked";
import { BrawlerStatsSection } from "./_components/BrawlerStatsSection";
import { ModeRadarChart } from "./_components/ModeRadarChart";
import { PersonList } from "./_components/PersonList";
import { PlayerOverview } from "./_components/PlayerOverview";
import { SeasonCountdown } from "./_components/SeasonCountdown";
import styles from "./page.module.scss";

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

const MODE_KEYS = [
  "knockout",
  "gemGrab",
  "bounty",
  "heist",
  "brawlBall",
  "hotZone",
] as const;

type ModeKey = (typeof MODE_KEYS)[number];

interface PlayerResponse {
  tag: string;
  name: string;
  nameColor?: string;
  iconId: number;
  currentRank?: number;
  trophies?: number;
  highestTrophies?: number;
  vs3Victories?: number;
  soloVictories?: number;
}

async function getPlayerData(tag: string): Promise<PlayerResponse | null> {
  const res = await fetch(
    `${apiUrl}/api/v1/players/${encodeURIComponent(tag)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60  },
    },
  );
  if (!res.ok) {
    return null;
  }
  const data = await res.json();
  return {
    tag: data.tag,
    name: data.name,
    nameColor: data.nameColor,
    iconId: data.iconId,
    currentRank: data.currentRank,
    trophies: data.trophies,
    highestTrophies: data.highestTrophies,
    vs3Victories: data.vs3Victories,
    soloVictories: data.soloVictories,
  } satisfies PlayerResponse;
}

async function getSeasonData() {
  const res = await fetch(`${apiUrl}/api/v1/seasons/current`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

type ModeStat = {
  win_rate: number;
  battle_count: number;
};

interface PersonStat {
  tag: string;
  name: string;
  icon_id: number;
  rank: number;
  win_rate: number;
  battle_count: number;
}

interface BrawlerStatApi {
  id: number;
  gadgets: number[];
  star_powers: number[];
  gears: number[];
  pick_rate: number;
  win_rate: number;
  battle_count: number;
  name?: string;
}

interface PlayerStats {
  player: {
    tag: string;
    name: string;
    icon_id: number;
    rank: number;
  };
  season: {
    battle_count: number;
    win_rate: number;
    highest_rank: number;
  };
  brawler_stats: BrawlerStatApi[];
  mode_stats: Record<ModeKey, ModeStat> & Partial<Record<string, ModeStat>>;
  high_win_rate_teammates: PersonStat[];
  most_defeated_enemies: PersonStat[];
  battles: any[];
}
async function getPlayerStats(tag: string) {
  const res = await fetch(
    `${apiUrl}/api/v1/players/${encodeURIComponent(tag)}/stats`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 },
    },
  );
  if (!res.ok) {
    return null;
  }
  return res.json();
}

const toPercent = (value: number) =>
  Math.max(0, Number.isFinite(value) ? value * 100 : 0);

const formatSeasonRange = (
  startDateTime?: string,
  endDateTime?: string,
): string | null => {
  if (!startDateTime || !endDateTime) {
    return null;
  }

  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  const startYear = start.getUTCFullYear();
  const endYear = end.getUTCFullYear();
  const startMonth = start.getUTCMonth() + 1;
  const endMonth = end.getUTCMonth() + 1;

  if (startYear === endYear) {
    if (startMonth === endMonth) {
      return `${startYear}/${startMonth}`;
    }
    return `${startYear}/${startMonth}-${endMonth}`;
  }

  return `${startYear}/${startMonth}-${endYear}/${endMonth}`;
};

function normalizeBattleRecord(battle: any) {
  if (!battle) return null;

  const raw = battle.raw_data ?? {};
  const baseBattle = raw.battle ?? {};
  const teams = baseBattle.teams ?? battle.teams ?? [];

  const normalizedBattle = {
    ...raw,
    event: raw.event ?? {
      id: raw.event?.id ?? null,
      mode: baseBattle.mode ?? battle.mode ?? raw.mode,
      map: raw.event?.map ?? battle.map ?? baseBattle.map,
    },
    battle: {
      ...baseBattle,
      type: baseBattle.type ?? battle.type ?? "soloRanked",
      result: baseBattle.result ?? battle.result ?? raw.result,
      teams,
      players: baseBattle.players ?? raw.players,
      trophyChange:
        baseBattle.trophyChange ?? battle.trophy_change ?? raw.trophyChange,
      duration: baseBattle.duration ?? battle.duration ?? raw.duration,
    },
    battleTime:
      raw.battleTime ??
      battle.battle_time ??
      battle.battleTime ??
      new Date().toISOString(),
    rounds: raw.rounds ?? battle.rounds ?? [],
  };

  if (
    (!Array.isArray(normalizedBattle.rounds) ||
      normalizedBattle.rounds.length === 0) &&
    normalizedBattle.battle
  ) {
    normalizedBattle.rounds = [
      {
        battleTime: normalizedBattle.battleTime,
        result: normalizedBattle.battle.result ?? "unknown",
        duration: normalizedBattle.battle.duration ?? 0,
      },
    ];
  }

  return normalizedBattle;
}

export async function PlayerStatsPage({
  promiseParams,
}: {
  promiseParams: Promise<{ locale: string; tag: string }>;
}) {
  const { locale, tag } = await promiseParams;
  const t = await getTranslations({ locale, namespace: "playerStats" });
  const tPlayers = await getTranslations({ locale, namespace: "players" });

  const playerData = await getPlayerData(tag);

  const seasonData = await getSeasonData();
  if (!playerData) {
    return <div className={styles.container}>{t("playerNotFound")}</div>;
  }
  const playerStats: PlayerStats | null = await getPlayerStats(tag);

  console.log(
    "playerStats.high_win_rate_teammates",
    playerStats?.high_win_rate_teammates,
  );

  if (!playerStats) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <SeasonCountdown
            startDateTime={seasonData?.startDateTime ?? ""}
            endDateTime={seasonData?.endDateTime ?? ""}
            nextStartDateTime={seasonData?.nextStartDateTime ?? ""}
            labels={{
              inSeason: t("seasonCountdown.inSeason"),
              downtime: t("seasonCountdown.downtime"),
              unavailable: t("seasonCountdown.unavailable"),
            }}
          />
          <div className={styles.sectionCard}>
            <p className={styles.notice}>{t("statsUnavailable")}</p>
          </div>
        </div>
      </div>
    );
  }

  const localePromise = Promise.resolve({ locale });
  const numberFormatter = new Intl.NumberFormat(locale);
  const percentFormatter = new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const brawlerStats = (playerStats.brawler_stats ?? []).map((stat) => ({
    id: stat.id,
    name: stat.name,
    pickRate: stat.pick_rate ?? 0,
    winRate: stat.win_rate ?? 0,
    battleCount: stat.battle_count ?? 0,
    gadgets: Array.isArray(stat.gadgets) ? stat.gadgets : [],
    starPowers: Array.isArray(stat.star_powers) ? stat.star_powers : [],
    gears: Array.isArray(stat.gears) ? stat.gears : [],
  }));

  const topBrawlersForOverview = brawlerStats
    .filter((stat) => (stat.battleCount ?? 0) > 0)
    .sort((a, b) => (b.battleCount ?? 0) - (a.battleCount ?? 0))
    .slice(0, 5)
    .map((stat) => ({
      id: stat.id,
      name: stat.name,
      pickRate: stat.pickRate ?? 0,
      winRate: stat.winRate ?? 0,
      battleCount: stat.battleCount ?? 0,
    }));

  const modeRadarData = MODE_KEYS.map((modeKey) => {
    const stat = playerStats.mode_stats?.[modeKey] ?? {
      win_rate: 0,
      battle_count: 0,
    };
    return {
      key: modeKey,
      label: t(`modeRadar.labels.${modeKey}`),
      icon: `/modes/${modeKey}.png`,
      winRate: Math.round(toPercent(stat.win_rate ?? 0) * 10) / 10,
      battleCount: stat.battle_count ?? 0,
    };
  }).filter((datum) => datum.battleCount > 0 || datum.winRate > 0);

  const teammateLabels = {
    winRate: t("person.winRate"),
    battleCount: t("person.battleCount"),
    rank: (rank: number) =>
      rank > 0 ? tPlayers("rank", { rank }) : t("rankUnknown"),
    empty: t("teammates.empty"),
  };

  const enemyLabels = {
    winRate: t("person.winRate"),
    battleCount: t("person.battleCount"),
    rank: (rank: number) =>
      rank > 0 ? tPlayers("rank", { rank }) : t("rankUnknown"),
    empty: t("enemies.empty"),
  };

  const soloRankedBattles = (playerStats.battles ?? [])
    .map((battle) => normalizeBattleRecord(battle))
    .filter(
      (battle) =>
        battle?.battle?.type === "soloRanked" && battle.rounds?.length,
    )
    .sort((a, b) => {
      const timeA = new Date(a?.battleTime ?? 0).getTime();
      const timeB = new Date(b?.battleTime ?? 0).getTime();
      return timeB - timeA;
    });

  const overviewPlayer = {
    name: playerData.name,
    tag: playerData.tag,
    iconId: playerData.iconId ?? playerStats.player.icon_id,
    nameColor: playerData.nameColor,
  };

  const overviewStats = {
    battleCount: {
      label: t("overview.battleCount"),
      value: numberFormatter.format(playerStats.season.battle_count ?? 0),
    },
    winRate: {
      label: t("overview.winRate"),
      value: percentFormatter.format(playerStats.season.win_rate ?? 0),
      percentage: Math.max(
        0,
        Number.isFinite(playerStats.season.win_rate)
          ? (playerStats.season.win_rate ?? 0) * 100
          : 0,
      ),
    },
    highestRank: {
      rank: playerStats.season.highest_rank ?? null,
      alt:
        (playerStats.season.highest_rank ?? 0) > 0
          ? tPlayers("rank", { rank: playerStats.season.highest_rank })
          : t("rankUnknown"),
    },
  };

  const overviewSubtitle =
    formatSeasonRange(seasonData?.startDateTime, seasonData?.endDateTime) ??
    t("playerSubtitle");

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <SeasonCountdown
          startDateTime={seasonData?.startDateTime ?? ""}
          endDateTime={seasonData?.endDateTime ?? ""}
          nextStartDateTime={seasonData?.nextStartDateTime ?? ""}
          labels={{
            inSeason: t("seasonCountdown.inSeason"),
            downtime: t("seasonCountdown.downtime"),
            unavailable: t("seasonCountdown.unavailable"),
          }}
        />

        <div className={styles.sectionGroup}>
          <PlayerOverview
            player={overviewPlayer}
            stats={overviewStats}
            brawlers={topBrawlersForOverview}
            subtitle={overviewSubtitle}
          />
        </div>

        <div className={styles.dualColumn}>
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>{t("modeRadar.title")}</h2>
            <ModeRadarChart
              data={modeRadarData}
              labels={{
                tooltipWinRate: t("modeRadar.tooltipWinRate"),
                tooltipBattleCount: t("modeRadar.tooltipBattleCount"),
                empty: t("modeRadar.empty"),
              }}
            />
          </div>
        </div>

        <div className={styles.peopleGrid}>
          <div className={styles.sectionCard}>
            <PersonList
              locale={locale}
              title={t("teammates.title")}
              people={playerStats.high_win_rate_teammates ?? []}
              labels={teammateLabels}
            />
          </div>
          <div className={styles.sectionCard}>
            <PersonList
              locale={locale}
              title={t("enemies.title")}
              people={playerStats.most_defeated_enemies ?? []}
              labels={enemyLabels}
              align="right"
            />
          </div>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.battlesSection}>
            <h2 className={styles.sectionTitle}>{t("battles.title")}</h2>
            {soloRankedBattles.length === 0 ? (
              <p className={styles.notice}>{t("battles.empty")}</p>
            ) : (
              <div className={styles.battleList}>
                <ServerLocaleMessageProviderWrapper params={localePromise}>
                  {soloRankedBattles.map((battleLog: any, index: number) => (
                    <BattleLogSoloRanked
                      key={`${battleLog?.battleTime}-${index}`}
                      battleLog={battleLog}
                      ownTag={tag}
                    />
                  ))}
                </ServerLocaleMessageProviderWrapper>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; tag: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <PlayerStatsPage promiseParams={params} />
    </Suspense>
  );
}
