import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import "../globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
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

const locales = ["en", "ja"];

export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale: locale,
  }));
}

export default async function RootLayout({
  children,
  params,
  modal,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
  modal: React.ReactNode;
}>) {
  "use cache";
  cacheLife("max");

  return (
    <html lang="en">
      <head>
        <link
          rel="manifest"
          href="/manifest.webmanifest"
          crossOrigin="use-credentials"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Header />
        <main>{children}</main>
        <div key="modal">{modal}</div>
        <div id="modal-root" />
        <Footer params={params} />
        <Suspense fallback={null}>
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
        </Suspense>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <Suspense fallback={null}>
          <Toaster position="top-center" />
        </Suspense>
      </body>
    </html>
  );
}
