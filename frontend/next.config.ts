import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "cdn.brawlify.com",
        pathname: "/**/**/**"
      }
    ]
  }
};

export default nextConfig;
