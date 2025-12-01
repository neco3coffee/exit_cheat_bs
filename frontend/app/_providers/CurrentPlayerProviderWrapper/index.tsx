import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { getCurrentPlayer } from "@/app/_lib/serverAuth";
import { CurrentPlayerProvider } from "@/app/_providers/CurrentPlayerProvider";

export async function CurrentPlayerProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value || "";
  const player = sessionToken ? await getCurrentPlayer() : null;

  return (
    <CurrentPlayerProvider player={player}>{children}</CurrentPlayerProvider>
  );
}
