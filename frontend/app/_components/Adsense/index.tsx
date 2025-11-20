"use client";
import { useEffect } from "react";

declare global {
  var adsbygoogle: unknown[];
}

export default function Adsense() {
  const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";
  const isCi = (process.env.NEXT_PUBLIC_CI ?? "false") === "true";

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      isProduction &&
      !isCi &&
      window.adsbygoogle
    ) {
      window.adsbygoogle.push({});
    }
  }, [isProduction, isCi]);

  if (typeof window === "undefined" || !isProduction || isCi) {
    return (
      <div
        style={{
          width: "100%",
          height: "80px",
          textAlign: "center",
          padding: "10px 0",
          backgroundColor: "gray",
          color: "white",
        }}
      >
        Ad Placeholder
      </div>
    );
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-3651729056445822"
      data-ad-slot="5225755600"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
}
