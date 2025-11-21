import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tag: string }> },
) {
  try {
    const { tag } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session_token");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      `${apiUrl}/api/v1/players/${encodeURIComponent(tag)}/reports`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_token=${sessionCookie.value}`,
        },
        // cookieを含める
        credentials: "include",
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
