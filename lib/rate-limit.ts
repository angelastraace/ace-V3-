import { NextResponse } from "next/server";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 10;

function unavailable() {
  return NextResponse.json({ status: "blocked", reason: "Rate-limit service unavailable" }, { status: 503 });
}

function configured() {
  const url = process.env.RATE_LIMIT_SERVICE_URL?.trim();
  const token = process.env.RATE_LIMIT_SERVICE_TOKEN?.trim();
  return url && token ? { url, token } : null;
}

function isPreviewUpstash(url: string) {
  try {
    return process.env.VERCEL_ENV === "preview" && new URL(url).hostname.endsWith(".upstash.io");
  } catch {
    return false;
  }
}

async function rateLimitKey(bucket: string, ip: string) {
  const input = new TextEncoder().encode(`${bucket}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", input);
  const fingerprint = Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
  return `ace:rate-limit:${bucket}:${fingerprint}`;
}

async function checkUpstash(url: string, token: string, bucket: string, ip: string) {
  const key = await rateLimitKey(bucket, ip);
  const response = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify([["INCR", key], ["EXPIRE", key, WINDOW_SECONDS, "NX"]]),
    cache: "no-store",
    signal: AbortSignal.timeout(2_500),
  });
  if (!response.ok) throw new Error("Upstash rejected rate-limit request");
  const result = await response.json() as Array<{ result?: unknown }>;
  const count = result[0]?.result;
  if (typeof count !== "number") throw new Error("Upstash returned an invalid rate-limit response");
  return count > MAX_REQUESTS_PER_WINDOW
    ? NextResponse.json({ status: "rate_limited" }, { status: 429, headers: { "retry-after": String(WINDOW_SECONDS) } })
    : null;
}

async function checkAdapter(url: string, token: string, bucket: string, ip: string, requestId: string) {
  const response = await fetch(`${url.replace(/\/$/, "")}/check`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}`, "x-request-id": requestId },
    body: JSON.stringify({ bucket, ip }),
    cache: "no-store",
    signal: AbortSignal.timeout(2_500),
  });
  if (response.status === 429) return NextResponse.json({ status: "rate_limited" }, { status: 429, headers: { "retry-after": response.headers.get("retry-after") || "60" } });
  if (!response.ok) throw new Error("rate-limit provider rejected request");
  return null;
}

/** Sensitive endpoints fail closed. Preview supports a direct Upstash REST database; other environments retain the ACE adapter contract. */
export async function enforceRateLimit(req: Request, bucket: string) {
  const service = configured();
  if (!service) return NextResponse.json({ status: "blocked", reason: "Rate limiting not configured" }, { status: 503 });

  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  try {
    return isPreviewUpstash(service.url)
      ? await checkUpstash(service.url, service.token, bucket, ip)
      : await checkAdapter(service.url, service.token, bucket, ip, requestId);
  } catch {
    return unavailable();
  }
}
