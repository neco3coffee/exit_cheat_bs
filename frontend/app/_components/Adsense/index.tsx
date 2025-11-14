"use client";
import { useEffect } from "react";

declare global {
  var adsbygoogle: unknown[];
}

export default function Adsense() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "production" &&
      process.env.CI !== "true" &&
      window.adsbygoogle
    ) {
      window.adsbygoogle.push({});
    }
  }, []);

  if (
    typeof window === "undefined" ||
    process.env.NODE_ENV !== "production" ||
    process.env.CI === "true"
  ) {
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
