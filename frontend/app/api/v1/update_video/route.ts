import { NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

export async function POST(req: Request) {
  const body = await req.json();
  const apiKey = req.headers.get("x-api-key");

  // 認証チェック
  if (apiKey !== process.env.LAMBDA_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rails APIに中継
  const res = await fetch(`${apiUrl}/api/v1/update_video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.LAMBDA_API_KEY || "",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
