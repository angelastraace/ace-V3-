import { NextRequest, NextResponse } from "next/server";
import { getBetterAuth } from "../../../../../lib/better-auth";
import { requireAdmin } from "../../../../../lib/server-auth";

const failure = (status: number) => NextResponse.json({ status: "failure" }, { status, headers: { "cache-control": "no-store" } });

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const auth = getBetterAuth();
    if (!auth) return failure(503);

    const input = await request.json().catch(() => null) as { userId?: unknown; newPassword?: unknown } | null;
    if (typeof input?.userId !== "string" || !input.userId.trim() || typeof input.newPassword !== "string" || !input.newPassword) return failure(400);

    await auth.api.setUserPassword({
      body: { userId: input.userId.trim(), newPassword: input.newPassword },
      headers: request.headers,
    });
    return NextResponse.json({ status: "success" }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "AUTHENTICATION_REQUIRED") return failure(401);
    if (message === "FORBIDDEN") return failure(403);
    return failure(400);
  }
}
