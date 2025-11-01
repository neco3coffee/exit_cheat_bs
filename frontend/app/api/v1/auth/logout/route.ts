import { type NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    // Docker Compose環境ではapp:3000を使用
    const backendUrl = "http://app:3000";

    const response = await fetch(`${backendUrl}/api/v1/auth/logout`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // cookieを含める
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const nextResponse = NextResponse.json(data);
    nextResponse.headers.append(
      "Set-Cookie",
      `session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
    );

    return nextResponse;
  } catch (error) {
    console.error("Logout proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
