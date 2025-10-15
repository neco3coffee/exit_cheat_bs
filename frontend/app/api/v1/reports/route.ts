import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch("http://app:3000/api/v1/reports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  const res = await fetch("http://app:3000/api/v1/reports", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
