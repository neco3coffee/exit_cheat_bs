// app/analytics.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const enabled = process.env.NEXT_PUBLIC_ENABLE_GA === "true";

  useEffect(() => {
    if (!enabled || !gaId) return;
    const qs = searchParams.toString();
    const page_path = qs ? `${pathname}?${qs}` : pathname;
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "page_view", { page_path });
    }
  }, [pathname, searchParams, enabled, gaId]);

  if (!enabled || !gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
