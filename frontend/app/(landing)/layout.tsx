import Script from "next/script";
import "../globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <Script
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
          src="https//www.ezojs.com/ezoic/sa.min.js"
        ></Script>
        <Script strategy="beforeInteractive">
          window.ezstandalone = window.ezstandalone || {}; ezstandalone.cmd =
          ezstandalone.cmd || [];
        </Script>
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
