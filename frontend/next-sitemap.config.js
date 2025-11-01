/** @type {import('next-sitemap').IConfig} */

// Default site URL if environment variable is not set
const DEFAULT_SITE_URL = "https://safebrawl.com";

module.exports = {
  siteUrl: process.env.SITE_URL || DEFAULT_SITE_URL,
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  // Exclude API routes and special Next.js paths
  exclude: ["/api/*", "/_next/*", "/[locale]/api/*"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  },
  // Add alternate language support for i18n
  alternateRefs: [
    {
      href: process.env.SITE_URL || DEFAULT_SITE_URL,
      hreflang: "en",
    },
    {
      href: `${process.env.SITE_URL || DEFAULT_SITE_URL}/ja`,
      hreflang: "ja",
    },
  ],
};
