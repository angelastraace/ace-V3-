import { NextRequest, NextResponse } from "next/server";
import { createReviewerSession, previewReviewerCookie, previewReviewerEnabled } from "../../../../lib/reviewer-session";

export async function POST(request: NextRequest) {
  if (!previewReviewerEnabled()) return NextResponse.json({ status: "not_found" }, { status: 404 });
  const input = await request.json().catch(() => null) as { role?: unknown } | null;
  if (!input || (input.role !== "user" && input.role !== "admin")) {
    return NextResponse.json({ status: "invalid_request" }, { status: 400, headers: { "cache-control": "no-store" } });
  }
  const session = createReviewerSession(input.role);
  if (!session) return NextResponse.json({ status: "blocked" }, { status: 503 });
  const response = NextResponse.json({ status: "ok" }, { headers: { "cache-control": "no-store" } });
  response.cookies.set(previewReviewerCookie, session, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 8 * 60 * 60 });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ status: "ok" });
  response.cookies.set(previewReviewerCookie, "", { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 0 });
  return response;
}
