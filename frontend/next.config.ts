import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactStrictMode: false,
  output: "standalone",
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "cdn.brawlify.com",
        pathname: "/**/**/**",
      },
    ],
  },
};

export default nextConfig;
