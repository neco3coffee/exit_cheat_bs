"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    const page_path = qs ? `${pathname}?${qs}` : pathname;

    sendGAEvent("event", "page_view", { page_path: page_path });
  }, [pathname, searchParams]);

  return null;
}
