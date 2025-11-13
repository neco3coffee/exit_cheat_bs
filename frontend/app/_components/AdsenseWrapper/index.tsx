"use client";
import dynamic from "next/dynamic";

const Adsense = dynamic(() => import("../Adsense"), { ssr: false });

export default function AdsenseWrapper({ maxHeight }: { maxHeight?: number }) {
  return (
    <div
      style={{
        width: "100%",
        maxHeight: maxHeight ? `${maxHeight}px` : "none",
        overflow: "hidden",
      }}
    >
      <Adsense />
    </div>
  );
}
