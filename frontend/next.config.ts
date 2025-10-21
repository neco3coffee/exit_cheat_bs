import type { NextConfig } from "next";
import createNextIntPlugin from "next-intl/plugin";

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
  experimental: {
    optimizeCss: true,
  },
  async headers() {
    return [
      {
        source: "/:locale/players/:tag",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, must-revalidate",
          },
        ],
      },
      {
        source: "/:locale/players/search",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=15, must-revalidate",
          },
        ]
      },
    ];
  },
};

const withNextIntl = createNextIntPlugin("./app/_messages/i18n/request.tsx");

export default withNextIntl(nextConfig);
