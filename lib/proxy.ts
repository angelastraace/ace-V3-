import { NextResponse } from "next/server";

type ProviderProxyOptions = {
  timeoutMs?: number;
  allowMethods?: string[];
  forwardCookies?: boolean;
  requireIdempotency?: boolean;
  requireSameOrigin?: boolean;
};

function validProviderUrl(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (process.env.NODE_ENV === "production" && url.protocol !== "https:") return false;
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // server-to-server clients may omit Origin
  try {
    const requestOrigin = new URL(req.url).origin;
    const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin : requestOrigin;
    return origin === requestOrigin || origin === configuredOrigin;
  } catch {
    return false;
  }
}

export async function providerProxy(
  req: Request,
  baseUrl: string | undefined,
  token: string | undefined,
  path: string,
  options: ProviderProxyOptions = {},
) {
  if (!baseUrl || !token || !validProviderUrl(baseUrl)) {
    return NextResponse.json({ status:"blocked", reason:"Production provider not configured" }, { status:503 });
  }

  const method = req.method.toUpperCase();
  const allowed = options.allowMethods ?? ["GET","POST","PUT","PATCH","DELETE"];
  if (!allowed.includes(method)) return NextResponse.json({ status:"method_not_allowed" }, { status:405 });

  if (options.requireSameOrigin !== false && !["GET","HEAD","OPTIONS"].includes(method) && !isSameOrigin(req)) {
    return NextResponse.json({ status:"forbidden", reason:"Origin check failed" }, { status:403 });
  }

  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > 1_048_576) return NextResponse.json({ status:"payload_too_large" }, { status:413 });

  const suppliedIdempotencyKey = req.headers.get("idempotency-key")?.trim();
  if (options.requireIdempotency && !suppliedIdempotencyKey) {
    return NextResponse.json({ status:"invalid_request", reason:"Idempotency-Key header required" }, { status:400 });
  }

  const url = `${baseUrl.replace(/\/$/,"")}/${path.replace(/^\//,"")}`;
  const body = method === "GET" || method === "HEAD" ? undefined : await req.text();
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  const headers: Record<string,string> = {
    accept: "application/json",
    "content-type": req.headers.get("content-type") || "application/json",
    authorization: `Bearer ${token}`,
    "x-request-id": requestId,
  };
  if (!['GET','HEAD'].includes(method)) headers["idempotency-key"] = suppliedIdempotencyKey || crypto.randomUUID();
  if (options.forwardCookies !== false && req.headers.get("cookie")) headers.cookie = req.headers.get("cookie")!;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 8_000);
    const response = await fetch(url, { method, headers, body, cache:"no-store", signal:controller.signal });
    clearTimeout(timer);

    const text = await response.text();
    const out = new NextResponse(text, {
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type") || "application/json",
        "cache-control": "no-store, max-age=0",
        "x-request-id": requestId,
      },
    });
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) out.headers.set("set-cookie", setCookie);
    return out;
  } catch {
    return NextResponse.json({ status:"unavailable", reason:"Provider request failed", requestId }, { status:502, headers:{"cache-control":"no-store"} });
  }
}
