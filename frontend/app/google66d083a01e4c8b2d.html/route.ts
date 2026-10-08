import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse(
    "google-site-verification: google66d083a01e4c8b2d.html\n",
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    }
  );
}
