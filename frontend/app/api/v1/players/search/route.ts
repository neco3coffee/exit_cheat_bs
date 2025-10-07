import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const history = searchParams.get("history");
    const rank = searchParams.get("rank");

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Player name is required" },
        { status: 400 },
      );
    }

    // バックエンドサービスにリクエスト
    const response = await fetch(
      `http://app:3000/api/v1/players/search?name=${encodeURIComponent(
        name,
      )}&history=${history === "true"}&rank=${rank || "0"}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch players" },
        { status: response.status },
      );
    }

    const players = await response.json();
    return NextResponse.json(players);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
