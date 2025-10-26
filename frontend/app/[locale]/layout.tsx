import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Footer from "@/app/_components/Footer";
import Header from "@/app/_components/Header";
import "../globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
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

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
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
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        <main>{children}</main>
        <Suspense fallback={null}>
          <Footer params={params} />
        </Suspense>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
