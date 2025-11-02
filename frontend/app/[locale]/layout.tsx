import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import "../globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { cacheLife } from "next/cache";
import Script from "next/script";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const baseUrl = "https://safebrawl.com";

  if (locale === "ja") {
    return {
      title: "SafeBrawl - ブロスタ利敵献上プレイヤー回避サービス",
      description:
        "ブロスタで利敵行為や献上プレイヤーを回避してランクマッチを楽しもう。SafeBrawlで問題のあるプレイヤーを事前にチェック。",
      openGraph: {
        title: "SafeBrawl - ブロスタ利敵献上プレイヤー回避サービス",
        description:
          "ブロスタで利敵行為や献上プレイヤーを回避してランクマッチを楽しもう。SafeBrawlで問題のあるプレイヤーを事前にチェック。",
        images: [
          {
            url: `${baseUrl}/ja_ogp.png`,
            width: 1200,
            height: 675,
            alt: "SafeBrawl - ブロスタ利敵献上プレイヤー回避サービス",
          },
        ],
        locale: "ja_JP",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "SafeBrawl - ブロスタ利敵献上プレイヤー回避サービス",
        description:
          "ブロスタで利敵行為や献上プレイヤーを回避してランクマッチを楽しもう。SafeBrawlで問題のあるプレイヤーを事前にチェック。",
        images: [`${baseUrl}/ja_ogp.png`],
      },
      other: {
        "format-detection": "telephone=no",
      },
    };
  }

  // Default to English
  return {
    title: "SafeBrawl - Avoid griefing / feeding players in Brawl Stars",
    description:
      "Avoid griefing / feeding players in Brawl Stars ranked matches. Check problematic players before your game with SafeBrawl.",
    openGraph: {
      title: "SafeBrawl - Avoid griefing / feeding players in Brawl Stars",
      description:
        "Avoid griefing / feeding players in Brawl Stars ranked matches. Check problematic players before your game with SafeBrawl.",
      images: [
        {
          url: `${baseUrl}/en_ogp.png`,
          width: 1200,
          height: 675,
          alt: "SafeBrawl - Avoid griefing / feeding players in Brawl Stars",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "SafeBrawl - Avoid griefing / feeding players in Brawl Stars",
      description:
        "Avoid griefing / feeding players in Brawl Stars ranked matches. Check problematic players before your game with SafeBrawl.",
      images: [`${baseUrl}/en_ogp.png`],
    },
    other: {
      "format-detection": "telephone=no",
    },
  };
}

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
  const { locale } = await params;

  return (
    <html lang={locale}>
      <head>
        <link
          rel="manifest"
          href="/manifest.webmanifest"
          crossOrigin="use-credentials"
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3651729056445822"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        ></Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Header params={params} />
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
