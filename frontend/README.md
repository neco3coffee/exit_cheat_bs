This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## SEO Configuration

This project uses [next-sitemap](https://github.com/iamvishnusankar/next-sitemap) to automatically generate `robots.txt` and `sitemap.xml` files during the build process.

### Configuration

The sitemap configuration is defined in `next-sitemap.config.js`. The sitemap will be automatically generated when running `npm run build`.

### Environment Variables

Set the `SITE_URL` environment variable to your production domain:

```bash
SITE_URL=https://safebrawl.com
```

If not set, it defaults to `https://safebrawl.com`.

### Generated Files

After building the project, the following files will be created in the `public` directory:
- `public/robots.txt` - Search engine crawler rules
- `public/sitemap.xml` - Complete sitemap with all routes

These files are automatically generated and should not be committed to the repository.


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
