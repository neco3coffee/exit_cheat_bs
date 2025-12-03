/** @type {import('next-sitemap').IConfig} */

const DEFAULT_SITE_URL = "https://safebrawl.com";
const siteUrl = (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  generateIndexSitemap: false,

  // ✅ transformは使わない（＝二重生成バグを物理的に殺す）
  transform: async (config, path) => {
    return {
      loc: path,
      lastmod: new Date().toISOString(),
      changefreq: "daily",
      priority: 0.7,
    };
  },
};
