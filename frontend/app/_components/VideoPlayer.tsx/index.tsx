"use client";

import Hls from "hls.js";
import { useEffect, useRef } from "react";

export default function VideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!src || !videoRef.current) return;
    if (src.endsWith(".m3u8") && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      return () => hls.destroy();
    } else {
      videoRef.current.src = src;
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      key={src}
      autoPlay
      loop
      muted
      controls
      playsInline
      style={{
        backgroundColor: "var(--blue-black)",
        aspectRatio: "16/9",
      }}
      preload="none"
    >
      <track kind="captions" src={src} label="No captions" />
    </video>
  );
}
