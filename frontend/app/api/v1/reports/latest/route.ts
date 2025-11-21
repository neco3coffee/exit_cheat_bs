import { NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

export async function GET() {
  const res = await fetch(`${apiUrl}/api/v1/reports/latest`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
