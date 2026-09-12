import { NextRequest, NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { getBetterAuth } from "../../../../lib/better-auth";
import { authMode } from "../../../../lib/config";
import { providerProxy } from "../../../../lib/proxy";
import { enforceRateLimit } from "../../../../lib/rate-limit";

function badRequest() {
  return NextResponse.json({ status: "invalid_request", reason: "Email and password are required" }, { status: 400, headers: { "cache-control": "no-store" } });
}

async function betterAuthLogin(request: NextRequest) {
  const auth = getBetterAuth();
  if (!auth) return NextResponse.json({ status: "blocked", reason: "Better Auth is not configured" }, { status: 503, headers: { "cache-control": "no-store" } });

  const input = await request.json().catch(() => null) as { email?: unknown; password?: unknown } | null;
  if (!input || typeof input.email !== "string" || typeof input.password !== "string" || !input.email.trim() || !input.password) return badRequest();

  const headers = new Headers(request.headers);
  headers.set("content-type", "application/json");
  headers.delete("content-length");
  const signInRequest = new NextRequest(new URL("/api/auth/sign-in/email", request.url), {
    method: "POST",
    headers,
    body: JSON.stringify({ email: input.email.trim(), password: input.password, rememberMe: true }),
  });
  return toNextJsHandler(auth).POST(signInRequest);
}

export async function POST(request: NextRequest) {
  const limited = await enforceRateLimit(request, "auth:login");
  if (limited) return limited;
  if (authMode === "legacy") return providerProxy(request, process.env.AUTH_SERVICE_URL, process.env.AUTH_SERVICE_TOKEN, "login", { allowMethods: ["POST"], requireSameOrigin: true });
  return betterAuthLogin(request);
}
