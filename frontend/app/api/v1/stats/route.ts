import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("http://app:3000/api/v1/stats", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 86400 }, // Cache for 1 day (86400 seconds)
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
