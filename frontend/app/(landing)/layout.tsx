import Script from "next/script";
import "../globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
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
