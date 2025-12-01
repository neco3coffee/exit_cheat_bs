import { Suspense } from "react";
import Loading from "@/app/_components/Loading";
import { CurrentPlayerProviderWrapper } from "@/app/_providers/CurrentPlayerProviderWrapper";

const apiUrl = "http://app:3000";

async function getCurrentPlayer(sessionToken: string) {
  try {
    const res = await fetch(`${apiUrl}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session_token=${sessionToken}`,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      return null;
    }
    const playerData = await res.json();
    const player = playerData.player;
    return player;
  } catch (error) {
    console.error("Error fetching current player:", error);
    return null;
  }
}

export default async function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <CurrentPlayerProviderWrapper>{children}</CurrentPlayerProviderWrapper>
    </Suspense>
  );
}
