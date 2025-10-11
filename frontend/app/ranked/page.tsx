"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatBattleLog } from "@/app/_lib/formatBattleLog";
import BattleLogSoloRanked from "@/app/ranked/_components/BattleLogSoloRanked";
import { Spinner } from "@/components/ui/spinner";
import styles from "./page.module.scss";

const Status = {
  Idle: "Idle",
  Loading: "Loading",
  Authenticated: "Authenticated",
  Unauthenticated: "Unauthenticated",
  Error: "Error",
};

interface Player {
  id: number;
  tag: string;
  name: string;
  club_name?: string | null;
  trophies: number;
  current_icon: string;
  rank: number;
}

export default function RankedPage() {
  const [status, setStatus] = useState(Status.Idle);
  const [player, setPlayer] = useState<Player | null>(null);
  const [battleLogs, setBattleLogs] = useState<any[] | null>(null);

  const checkAuth = async () => {
    setStatus(Status.Loading);

    const sessionToken = localStorage.getItem("session_token");
    if (!sessionToken) {
      setStatus(Status.Unauthenticated);
      return;
    }

    try {
      const res = await fetch("/api/v1/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        setStatus(Status.Unauthenticated);
        return;
      }

      const data = await res.json();
      if (data && data.player) {
        setPlayer(data.player);
        setStatus(Status.Authenticated);
      } else {
        setStatus(Status.Unauthenticated);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setStatus(Status.Error);
    }
  };

  // biome-ignore-start lint/correctness/useExhaustiveDependencies: レンダーのたびに実行されてほしくないため
  useEffect(() => {
    checkAuth();
  }, []);
  // biome-ignore-end lint/correctness/useExhaustiveDependencies: レンダーのたびに実行されてほしくないため

  useEffect(() => {
    if (status !== Status.Authenticated || !player) return;
    // Fetch player data
    try {
      (async () => {
        const tag = player.tag.startsWith("#")
          ? player.tag.substring(1)
          : player.tag;
        const res = await fetch(
          `/api/v1/players/${encodeURIComponent(tag)}/ranked`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          const formattedBattleLogs = formatBattleLog(data.battle_logs);
          setBattleLogs(formattedBattleLogs);
        }
      })();
    } catch (error) {
      console.error("Error fetching player data:", error);
    }
  }, [status, player]);

  if (status === Status.Idle || status === Status.Loading) {
    return (
      <div className={`${styles.container} justify-center`}>
        <Spinner className="size-12 text-blue-500" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {status === Status.Error && (
        <p>Error occurred. Please try again later.</p>
      )}
      {status === Status.Unauthenticated && (
        <>
          <h1>Ranked Page</h1>
          <p>To access this page, you need to login!</p>
          <Link className={styles.login} href="/account">
            Login
          </Link>
        </>
      )}
      {status === Status.Authenticated && (
        <>
          <div className={styles.reportsContainer}></div>
          <div className={styles.battlelogContainer}>
            {battleLogs &&
              battleLogs.map((battlelog, index) => {
                const tag = player?.tag.startsWith("#")
                  ? player?.tag.substring(1)
                  : player?.tag;
                return (
                  <BattleLogSoloRanked
                    key={`${battlelog.battleTime}-${index}`}
                    battleLog={battlelog}
                    ownTag={tag}
                  />
                );
              })}
            {!battleLogs ||
              (battleLogs?.length === 0 && (
                <h5>No ranked battle logs available.</h5>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
