import { NextResponse, type NextRequest } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { getBetterAuth } from "../../../../lib/better-auth";
import { registrationDisabledResponse } from "../../../../lib/server-auth";

async function handle(request: NextRequest) {
  if (request.nextUrl.pathname.includes("/sign-up")) return registrationDisabledResponse();
  const auth = getBetterAuth();
  if (!auth) return NextResponse.json({ status: "blocked", reason: "Better Auth is not configured" }, { status: 503, headers: { "cache-control": "no-store" } });
  const handler = toNextJsHandler(auth);
  return request.method === "GET" ? handler.GET(request) : handler.POST(request);
}

export const GET = handle;
export const POST = handle;
