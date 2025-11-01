/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://safebrawl.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  // Exclude API routes and special Next.js paths
  exclude: ['/api/*', '/_next/*', '/*/api/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
  // Add alternate language support for i18n
  alternateRefs: [
    {
      href: process.env.SITE_URL || 'https://safebrawl.com',
      hreflang: 'en',
    },
    {
      href: `${process.env.SITE_URL || 'https://safebrawl.com'}/ja`,
      hreflang: 'ja',
    },
  ],
}
