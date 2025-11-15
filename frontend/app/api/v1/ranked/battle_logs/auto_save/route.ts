import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session_token");

  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const res = await fetch(
    "http://app:3000/api/v1/ranked/battle_logs/auto_save",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session_token=${sessionCookie.value}`,
      },
      body: JSON.stringify(body),
      // cookieを含める
      credentials: "include",
    },
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
