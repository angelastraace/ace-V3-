import { NextResponse } from "next/server";

/**
 * Distributed rate-limit adapter. Production-sensitive endpoints fail closed
 * when no rate-limit service is configured. This avoids pretending an
 * in-memory serverless counter is a production control.
 */
export async function enforceRateLimit(req: Request, bucket: string) {
  const base = process.env.RATE_LIMIT_SERVICE_URL;
  const token = process.env.RATE_LIMIT_SERVICE_TOKEN;
  if (!base || !token) {
    return NextResponse.json({ status:"blocked", reason:"Production rate limiting not configured" }, { status:503 });
  }

  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  try {
    const response = await fetch(`${base.replace(/\/$/, "")}/check`, {
      method:"POST",
      headers:{
        "content-type":"application/json",
        authorization:`Bearer ${token}`,
        "x-request-id":requestId,
      },
      body:JSON.stringify({ bucket, ip:forwarded }),
      cache:"no-store",
      signal:AbortSignal.timeout(2500),
    });
    if (response.status === 429) return NextResponse.json({ status:"rate_limited" }, { status:429, headers:{"retry-after":response.headers.get("retry-after") || "60"} });
    if (!response.ok) throw new Error("rate-limit provider rejected request");
    return null;
  } catch {
    return NextResponse.json({ status:"blocked", reason:"Rate-limit service unavailable" }, { status:503 });
  }
}
