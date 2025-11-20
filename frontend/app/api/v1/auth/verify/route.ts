import { type NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://app:3000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${backendUrl}/api/v1/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    const sessionToken = response.headers.get("Set-Cookie");

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    if (sessionToken) {
      // クッキーをNextResponseに設定
      const nextResponse = NextResponse.json(data);
      nextResponse.headers.append("Set-Cookie", sessionToken);
      return nextResponse;
    }
  } catch (error) {
    console.error("Verify proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
