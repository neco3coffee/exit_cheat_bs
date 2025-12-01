"use client";
import { useEffect } from "react";

export default function LocalStorage({
  playerTag,
  playerName,
}: {
  playerTag: string;
  playerName: string;
}) {
  const tag = playerTag?.startsWith("#") ? playerTag.substring(1)! : playerTag!;

  // biome-ignore-start lint/correctness/useExhaustiveDependencies: レンダーのたびに実行されてほしくないため
  useEffect(() => {
    saveToLocalStorage();
  }, []);
  // biome-ignore-end lint/correctness/useExhaustiveDependencies: レンダーのたびに実行されてほしくないため

  function saveToLocalStorage() {
    if (typeof window !== "undefined") {
      const loglist: any[] = JSON.parse(
        localStorage.getItem("searchLogList") || "[]",
      );

      const filtered = loglist.filter((item) => item.tag !== tag);

      const newList = [{ tag: tag, name: playerName }, ...filtered];
      localStorage.setItem("searchLogList", JSON.stringify(newList));
    }
  }

  return <></>;
}
