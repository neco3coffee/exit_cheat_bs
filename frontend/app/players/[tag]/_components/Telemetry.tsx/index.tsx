// app/player/[tag]/Telemetry.tsx
"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { event } from "@/app/_utils/gtag"

export function Telemetry() {
  const params = useParams()
  const tag = params?.tag as string

  useEffect(() => {
    let source: "home_screen" | "battle_history" | "direct" = "direct"

    if (typeof window !== "undefined") {
      const s = sessionStorage.getItem("last_source")
      if (s === "home_screen" || s === "battle_history") {
        source = s as typeof source
      }
      sessionStorage.removeItem("last_source") // 使い捨て
    }

    event("player_detail_view", { source, tag })
  }, [])

  return null
}
