"use client";

import { useEffect, useRef } from "react";
import { PointModal } from "./PointModal";

interface PointHistory {
  id: number;
  point_type: string;
  points: number;
  created_at: string;
}

export default function PointsWatcher() {
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const checkPoints = async () => {
      try {
        const res = await fetch("/api/v1/points/undisplayed", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) return;

        const data = await res.json();
        console.log("Undisplayed points data:", data);
        const histories: PointHistory[] = data.point_histories;
        const currentTotal = data.total_points || 0;

        if (!histories || histories.length === 0) return;

        for (const history of histories) {
          // モーダルを表示し、閉じるのを待つ
          // point_type をそのまま渡して、PointModal 側で翻訳する
          await PointModal.open(
            history.points,
            history.point_type,
            currentTotal,
          );

          // 既読にする
          await fetch(`/api/v1/points/${history.id}/mark_displayed`, {
            method: "POST",
          });
        }
      } catch (e) {
        console.error("Failed to process points", e);
      }
    };

    checkPoints();
  }, []);

  return null;
}
