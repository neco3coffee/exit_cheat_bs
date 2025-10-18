import { NextResponse } from "next/server";

export async function GET({ params }: { params: Promise<{ tag: string }> }) {
  try {
    const { tag } = await params;

    // バックエンドサービスにリクエスト
    const response = await fetch(
      `http://app:3000/api/v1/players/${encodeURIComponent(tag)}`,
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
        { error: "Player not found" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
