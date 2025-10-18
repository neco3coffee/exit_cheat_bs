import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("http://app:3000/api/v1/reports/latest", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
