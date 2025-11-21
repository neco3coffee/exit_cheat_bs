"use client";

import { History } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import styles from "./index.module.scss";

type NameHistory = {
  id: number;
  name: string;
  icon_id?: string | null;
  changed_at: string;
};

type PlayerNameProps = {
  name: string;
  nameColor?: string | null;
  nameHistories?: NameHistory[] | null;
};

function normalizeColor(nameColor?: string | null) {
  if (!nameColor) return undefined;
  const normalized = nameColor.toString().replace(/^0x/i, "");
  if (normalized.length < 6) return undefined;
  return `#${normalized.slice(-6)}`;
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function PlayerName({
  name,
  nameColor,
  nameHistories,
}: PlayerNameProps) {
  const color = normalizeColor(nameColor);
  const hasHistories = Array.isArray(nameHistories) && nameHistories.length > 0;

  return (
    <div className={styles.container}>
      <h1 className={styles.name} style={color ? { color } : undefined}>
        {name}
      </h1>
      {hasHistories && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(styles.historyButton, "focus:outline-none")}
              aria-label="View name history"
            >
              <History className="size-4" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="bottom"
            className={cn(styles.historyContent, "shadow-lg")}
          >
            <ScrollArea className={styles.scrollArea}>
              <ul className={styles.list}>
                {nameHistories!.map((history, index) => {
                  const formattedDate = formatTimestamp(history.changed_at);
                  return (
                    <li
                      className={styles.item}
                      key={`${history.changed_at}-${index}`}
                    >
                      <div className={styles.iconWrapper}>
                        {history.icon_id ? (
                          <Image
                            src={`https://cdn.brawlify.com/profile-icons/regular/${history.icon_id}.png`}
                            alt={`${history.name}'s icon`}
                            width={36}
                            height={36}
                            sizes="36px"
                          />
                        ) : (
                          <span>—</span>
                        )}
                      </div>
                      <div className={styles.text}>
                        <span className={styles.historyName}>
                          {history.name}
                        </span>
                        <span className={styles.historyDate}>
                          {formattedDate}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
