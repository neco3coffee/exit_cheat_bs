"use client";

import { addHours, differenceInSeconds } from "date-fns";
import { Radar, Swords } from "lucide-react";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

export default function BattleLogAutoSaveIconToggle({
  expiresAt = addHours(new Date(), 12).toISOString(),
  defaultEnabled = false,
}: {
  expiresAt?: string | null;
  defaultEnabled?: boolean;
}) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [remaining, setRemaining] = useState<string>("");
  const [expireTime, setExpireTime] = useState<string | null>(expiresAt);

  const toggleEnabled = async (newEnabled: boolean) => {
    try {
      const res = await fetch(`/api/v1/ranked/battle_logs/auto_save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: newEnabled }),
      });

      if (!res.ok) {
        throw new Error("Failed to update auto save setting");
      }

      const data = await res.json();
      setExpireTime(data.auto_save_expires_at);
      setEnabled(data.auto_save_enabled);
    } catch (error) {
      console.error("Error updating auto save setting:", error);
    }
  };

  // biome-ignore-start lint/correctness/useExhaustiveDependencies: xxx
  // 残り時間: 0m0s 表記
  useEffect(() => {
    if (!enabled || !expireTime) {
      setRemaining("");
      return;
    }

    const updateRemaining = () => {
      const diffSec = differenceInSeconds(new Date(expireTime), new Date());

      if (diffSec <= 0) {
        setRemaining("0m0s");
        return;
      }

      const days = Math.floor(diffSec / 86400);
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;

      if (days > 0) {
        setRemaining(`${days}d${hours}h${minutes}m`);
      } else if (hours > 0) {
        setRemaining(`${hours}h${minutes}m${seconds}s`);
      } else {
        setRemaining(`${minutes}m${seconds}s`);
      }
    };

    updateRemaining();
    const timer = setInterval(updateRemaining, 1000); // 毎秒更新
    return () => clearInterval(timer);
  }, [enabled, expireTime]);
  // biome-ignore-end lint/correctness/useExhaustiveDependencies: xxx

  return (
    <div
      className="flex items-center gap-5 justify-center mt-3! border px-3 py-2! w-[320px]"
      style={{
        borderColor: "var(--black-border)",
        backgroundColor: "var(--black)",
        borderRadius: "16px",
      }}
    >
      <div className="relative w-fit flex items-center h-7">
        <div
          className={`h-7 w-7 text-3xl flex items-center justify-center align-middle ${enabled ? "text-blue-500" : "text-gray-400 opacity-50"}`}
        >
          ⚔️
        </div>
        <Radar
          className={`h-5.5 w-5.5 absolute -bottom-2 -right-2 ${
            enabled ? "text-blue-400 animate-pulse" : "text-gray-400 opacity-40"
          }`}
        />
      </div>

      {enabled && remaining ? (
        <span className="text-sm text-gray-500 w-[100px]">{remaining}⏳</span>
      ) : (
        <span className="text-sm text-gray-500 w-[100px]">OFF⌛️</span>
      )}

      <Switch
        checked={enabled}
        onCheckedChange={(v) => {
          setEnabled(v);
          toggleEnabled(v);
        }}
        className={`scale-150 pl-2 data-[state=checked]:bg-blue-500 bg-gray-400`}
      />
    </div>
  );
}
