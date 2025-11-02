import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://app:3000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 86400 }, // Cache for 1 day (86400 seconds)
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "No response body");
      console.error(
        `Backend stats API error: ${res.status} ${res.statusText}`,
        errorText,
      );
      return NextResponse.json(
        { approvedReportsCount: 0, totalPlayersCount: 0 },
        { status: 200 }, // Return 200 with default values to prevent frontend errors
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching stats from backend:", error);
    return NextResponse.json(
      { approvedReportsCount: 0, totalPlayersCount: 0 },
      { status: 200 }, // Return 200 with default values to prevent frontend errors
    );
  }
}
