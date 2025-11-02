import "../globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ background: "var(--black)", color: "var(--white)" }}>
        {children}
      </body>
    </html>
  );
}
