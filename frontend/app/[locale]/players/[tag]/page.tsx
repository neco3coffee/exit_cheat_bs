import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";
import Image from "next/image";
import Script from "next/script";
// import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import AdsenseWrapper from "@/app/_components/AdsenseWrapper";
import Record from "@/app/_components/Record";
import ClubName from "@/app/_lib/ClubName";
import { appendToEightDigits } from "@/app/_lib/common";
import { formatBattleLog } from "@/app/_lib/formatBattleLog";
import { Link } from "@/app/_messages/i18n/navigation";
import ServerLocaleMessageProviderWrapper from "@/app/_messages/ServerLocaleMessageProviderWrapper";
import BattleLog3vs3 from "@/app/[locale]/players/[tag]/_components/BattleLog3vs3";
import BattleLog5vs5 from "@/app/[locale]/players/[tag]/_components/BattleLog5vs5";
import BattleLogDuel from "@/app/[locale]/players/[tag]/_components/BattleLogDuel";
import BattleLogDuo from "@/app/[locale]/players/[tag]/_components/BattleLogDuo";
import BattleLogSolo from "@/app/[locale]/players/[tag]/_components/BattleLogSolo";
import BattleLogSoloRanked from "@/app/[locale]/players/[tag]/_components/BattleLogSoloRanked";
import BattleLogTrio from "@/app/[locale]/players/[tag]/_components/BattleLogTrio";
import { Telemetry } from "@/app/[locale]/players/[tag]/_components/Telemetry.tsx";
import BattleLogAutoSaveIconToggle from "./_components/BattleLogAutoSaveIconToggle";
import BattleLogLastStand from "./_components/BattleLogLastStand";
import Brawlers from "./_components/Brawlers";
import LocalStorage from "./_components/LocalStorage";
import PlayerName from "./_components/PlayerName";
import styles from "./page.module.scss";

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://app:3000";
const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";
const isCi = (process.env.NEXT_PUBLIC_CI ?? "false") === "true";

async function getPlayerData(sessionToken: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("playerData");

  const res = await fetch(`${apiUrl}/api/v1/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `session_token=${sessionToken}`,
    },
    credentials: "include",
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

const examplePlayerTags = ["Y2YPGCGC" /* neco3 */];

export async function generateStaticParams() {
  return examplePlayerTags.map((tag) => ({
    tag: tag,
  }));
}

type Player = {
  tag: string;
  name: string;
  nameColor: string;
  nameHistories?: Array<{
    id: number;
    name: string;
    icon_id: string | null;
    changed_at: string;
  }>;
  iconId: number;
  currentRank: number;
  trophies: number;
  highestTrophies: number;
  vs3Victories: number;
  soloVictories: number;
  club: {
    tag: string;
    name: string;
    badgeId: number;
  };
  brawlers: any[];
  auto_save_enabled?: boolean | null;
  auto_save_expires_at?: string | null;
  battlelog?: {
    items?: unknown[];
  } | null;
  error?: unknown;
};

export default function Page({
  params,
}: {
  params: Promise<{ locale: string; tag: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ServerLocaleMessageProviderWrapper params={params}>
        <PlayerPage params={params} />
      </ServerLocaleMessageProviderWrapper>
    </Suspense>
  );
}

async function PlayerPage({
  params,
}: {
  params: Promise<{ locale: string; tag: string }>;
}) {
  const { locale, tag } = await params;
  const res = await fetch(
    `${apiUrl}/api/v1/players/${encodeURIComponent(tag)}`,
    { next: { revalidate: 60 } },
  );
  const player: Player = await res.json();
  const battleLogs = formatBattleLog(player.battlelog?.items || []);

  // adminのみ他のプレイヤーのauto_saveをオンにできるようにするための処理
  const sessionToken = (await cookies()).get("session_token")?.value || null;
  const playerData = await (sessionToken ? getPlayerData(sessionToken) : null);
  const isAdmin = playerData?.player?.role === "admin" || false;

  const t = await getTranslations({ locale, namespace: "players" });
  const notInClubText = t("notInClub");

  if (player?.error) {
    return (
      <>
        <Telemetry />
        <p>{`No Player for: #${tag}`}</p>
        <Link
          href={`/`}
          style={{
            fontSize: "20px",
            textDecoration: "underline",
            marginTop: "10px",
          }}
        >
          back to Home
        </Link>
      </>
    );
  }

  return (
    <>
      {isProduction && !isCi && (
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3651729056445822"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
      <LocalStorage playerTag={player.tag} playerName={player.name} />
      <Telemetry />
      <div className={styles.container}>
        {/* プレイヤー基本情報 */}
        <div className={styles.basicInfoContainer}>
          <div className={styles.iconContainer}>
            <Image
              src={`https://cdn.brawlify.com/profile-icons/regular/${player.iconId}.png`}
              alt="icon"
              width={80}
              height={80}
              sizes="80px"
            />
            <h3>{player.tag}</h3>
          </div>
          <div className={styles.nameAndRankContainer}>
            <PlayerName
              name={player.name}
              nameColor={player?.nameColor}
              nameHistories={player?.nameHistories}
            />
            {player.currentRank >= 0 && (
              <div className={styles.rankContainer}>
                {player.currentRank > 0 && (
                  <Image
                    src={`https://cdn.brawlify.com/ranked/tiered/${appendToEightDigits(58000000, player.currentRank - 1)}.png`}
                    alt="rank"
                    height={60}
                    width={60}
                    sizes="60px"
                    style={{ height: "60px", width: "auto" }}
                  />
                )}
              </div>
            )}
          </div>
          <div className={styles.statsAndBrawlersContainer}>
            <Link
              href={`/players/${tag}/stats`}
              className={styles.statsLink}
              aria-label={`View ranked stats for ${player.name}`}
              title={`View ranked stats for ${player.name}`}
            >
              <span className={styles.statsLinkGlow} aria-hidden="true" />
              <span className={styles.statsLinkContent} aria-hidden="true">
                <span className={styles.statsLinkIcon}>📊</span>
              </span>
            </Link>
            <Brawlers player={player} />
          </div>
        </div>
        {isAdmin && (
          <BattleLogAutoSaveIconToggle
            expiresAt={player.auto_save_expires_at || null}
            defaultEnabled={player.auto_save_enabled || false}
            tag={tag}
            sessionToken={sessionToken}
          />
        )}
        <div className={styles.recordsContainer}>
          <Record
            label={t("seasonHigh")}
            imagePath="/icon_trophy1.png"
            value={player.trophies}
          />
          <Record
            label={t("allTimeHigh")}
            imagePath="/icon_trophy1.png"
            value={player.highestTrophies}
          />
          <Record
            label={t("3vs3Victories")}
            imagePath="/3vs3.png"
            value={player.vs3Victories}
          />
          <Record
            label={t("victories")}
            imagePath="https://cdn.brawlify.com/game-modes/regular/48000006.png"
            value={player.soloVictories}
          />
        </div>
        <div className={styles.clubContainer}>
          {player?.club?.badgeId ? (
            <Image
              src={`https://cdn.brawlify.com/club-badges/regular/${player.club.badgeId}.png`}
              alt=""
              width={32}
              height={36}
              sizes="32px"
            />
          ) : (
            <div></div>
          )}
          <div className={styles.clubNameContainer}>
            <ClubName
              clubName={player?.club?.name}
              notInClubText={notInClubText}
            />
          </div>
        </div>

        {/* バトル履歴 */}
        <div className={styles.battlelogContainer}>
          <h2>{t("battleLog")}</h2>
          <Suspense fallback={null}>
            <ServerLocaleMessageProviderWrapper params={params}>
              {battleLogs.map((battleLog, index) => {
                if (battleLog.rounds) {
                  return (
                    <BattleLogSoloRanked
                      key={`${battleLog?.battleTime}-${index}`}
                      battleLog={battleLog}
                      ownTag={tag}
                    />
                  );
                } else if (
                  battleLog.battle.teams &&
                  battleLog.battle.teams.length === 2 &&
                  battleLog.battle.teams[0].length === 3
                ) {
                  return (
                    <BattleLog3vs3
                      key={`${battleLog?.battleTime}-${index}`}
                      battleLog={battleLog}
                      ownTag={tag}
                    />
                  );
                } else if (
                  battleLog.battle.teams &&
                  battleLog.battle.teams.length === 2 &&
                  battleLog.battle.teams[0].length === 5
                ) {
                  return (
                    <BattleLog5vs5
                      key={`${battleLog?.battleTime}-${index}`}
                      battleLog={battleLog}
                      ownTag={tag}
                    />
                  );
                } else if (
                  battleLog.battle.teams &&
                  battleLog.battle.teams.length === 4
                ) {
                  return (
                    <BattleLogTrio
                      key={`${battleLog?.battleTime}-${index}`}
                      battleLog={battleLog}
                      ownTag={tag}
                    />
                  );
                } else if (
                  battleLog.battle.teams &&
                  battleLog.battle.teams.length === 5
                ) {
                  return (
                    <BattleLogDuo
                      key={`${battleLog?.battleTime}-${index}`}
                      battleLog={battleLog}
                      ownTag={tag}
                    />
                  );
                } else if (
                  battleLog.battle.players &&
                  battleLog.battle.players.length === 10
                ) {
                  return (
                    <BattleLogSolo
                      key={`${battleLog?.battleTime}-${index}`}
                      battleLog={battleLog}
                      ownTag={tag}
                    />
                  );
                } else if (
                  battleLog.battle.players &&
                  battleLog.battle.players.length === 2
                ) {
                  return (
                    <BattleLogDuel
                      key={`${battleLog?.battleTime}-${index}`}
                      battleLog={battleLog}
                      ownTag={tag}
                    />
                  );
                } else if (
                  battleLog.battle.players &&
                  battleLog.battle.players.length === 3 &&
                  battleLog.battle.level
                ) {
                  return (
                    <BattleLogLastStand
                      key={`${battleLog?.battleTime}-${index}`}
                      battleLog={battleLog}
                      ownTag={tag}
                    />
                  );
                } else if (
                  battleLog.battle.type === "friendly" &&
                  battleLog.battle.teams &&
                  battleLog.battle.teams.length === 2
                ) {
                  return (
                    <BattleLog3vs3
                      key={`${battleLog?.battleTime}-${index}`}
                      battleLog={battleLog}
                      ownTag={tag}
                    />
                  );
                } else {
                  return (
                    <div key={`${battleLog?.battleTime}-${index}`}>
                      {t("undefined")}
                    </div>
                  );
                }
              })}
            </ServerLocaleMessageProviderWrapper>
          </Suspense>
        </div>
        <AdsenseWrapper />
      </div>
    </>
  );
}
