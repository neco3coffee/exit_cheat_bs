"use client";
import dynamic from "next/dynamic";

const Adsense = dynamic(() => import("../Adsense"), { ssr: false });

export default function AdsenseWrapper() {
  return (
    <div style={{ width: "100%" }}>
      <Adsense />
    </div>
  );
}
