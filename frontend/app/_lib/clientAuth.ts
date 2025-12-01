"use client";

export const getCurrentPlayer = async () => {
  try {
    const res = await fetch("/api/v1/auth/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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
};
