import { NextResponse } from "next/server";
import { providerProxy } from "../../../../lib/proxy";
import { previewReviewerCookie, previewReviewerEnabled } from "../../../../lib/reviewer-session";

export async function POST(req: Request) {
  if (!previewReviewerEnabled()) return providerProxy(req, process.env.AUTH_SERVICE_URL, process.env.AUTH_SERVICE_TOKEN, "logout", { allowMethods: ["POST"], forwardCookies: true, requireSameOrigin: true });
  const response = NextResponse.json({ status: "ok" });
  response.cookies.set(previewReviewerCookie, "", { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 0 });
  return response;
}
