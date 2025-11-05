import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const { reportId } = await params;
  const res = await fetch(
    `http://app:3000/api/v1/reports/${reportId}/signed_url`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // cookieを含める
      credentials: "include",
    },
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
