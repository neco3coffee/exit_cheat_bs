import Script from "next/script";
import "../globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        {/* <Script
          strategy="beforeInteractive"
          src="https://cmp.gatekeeperconsent.com/min.js"
          data-cfasync="false"
        ></Script>
        <Script
          strategy="beforeInteractive"
          src="https://the.gatekeeperconsent.com/cmp.min.js"
          data-cfasync="false"
        ></Script>
        <Script
          strategy="beforeInteractive"
          src="//www.ezojs.com/ezoic/sa.min.js"
        ></Script>
        <Script strategy="beforeInteractive">
          window.ezstandalone = window.ezstandalone || {}; ezstandalone.cmd =
          ezstandalone.cmd || [];
        </Script> */}
        {process.env.NODE_ENV === "production" && process.env.CI !== "true" && (
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3651729056445822"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <link
          rel="manifest"
          href="/manifest.webmanifest"
          crossOrigin="use-credentials"
        />
      </head>
      <body style={{ background: "var(--black)", color: "var(--white)" }}>
        {children}
      </body>
    </html>
  );
}
