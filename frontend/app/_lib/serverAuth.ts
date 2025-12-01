import { cookies } from "next/headers";

const apiUrl = "http://app:3000";

export async function getCurrentPlayer() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value || "";

  try {
    const res = await fetch(`${apiUrl}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session_token=${sessionToken}`,
      },
      credentials: "include",
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
