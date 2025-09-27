import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL('https://cdn.brawlify.com/**/**/**')]
  }
};

export default nextConfig;
