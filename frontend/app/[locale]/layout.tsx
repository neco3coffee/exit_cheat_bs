import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import "../globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "../_messages/i18n/routing";
import { Analytics } from "../analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SafeBrawl",
  description: "avoid cheaters, enjoy Brawl Stars",
  other: {
    "format-detection": "telephone=no",
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  console.log("locale: ", locale);
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <head>
        <link
          rel="manifest"
          href="/manifest.webmanifest"
          crossOrigin="use-credentials"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NextIntlClientProvider
          locale={locale}
          messages={(await import(`@/app/_messages/${locale}.json`)).default}
        >
          <Header />
          <main>{children}</main>
          <Footer />
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
          <Suspense fallback={null}>
            <Analytics />
          </Suspense>
          <Toaster position="top-center" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
