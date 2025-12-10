import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://app:3000";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> },
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session_token")?.value || null;
    const { reportId } = await params;
    const res = await fetch(
      `${apiUrl}/api/v1/reports/${reportId}/report_reported_player`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_token=${sessionCookie}`,
        },
        body: await _req.text(),
        // cookieを含める
        credentials: "include",
      },
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Report reported player proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
