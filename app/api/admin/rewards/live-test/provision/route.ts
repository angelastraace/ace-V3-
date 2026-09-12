import { NextResponse } from "next/server";
import { getFinancialPool } from "../../../../../../lib/db/pool";
import { requireAdmin } from "../../../../../../lib/server-auth";
import { liveRewardTestEnabled, provisionPilot } from "../../../../../../lib/reward-live-test";

export async function POST(request: Request) {
  if (!liveRewardTestEnabled()) return NextResponse.json({ status: "blocked", reason: "LIVE_REWARD_TEST_DISABLED" }, { status: 503 });
  try {
    const admin = await requireAdmin();
    const pool = getFinancialPool();
    if (!pool) return NextResponse.json({ status: "blocked", reason: "FINANCIAL_DATABASE_CONFIGURATION_REQUIRED" }, { status: 503 });
    const key = request.headers.get("idempotency-key") || "";
    const body = await request.json().catch(() => null) as { clientUserId?: unknown } | null;
    if (typeof body?.clientUserId !== "string" || !body.clientUserId.trim()) return NextResponse.json({ status: "invalid_request" }, { status: 400 });
    return NextResponse.json(await provisionPilot(pool, admin.userId, body.clientUserId.trim(), key), { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "PROVISIONING_REJECTED";
    const status = reason === "AUTHENTICATION_REQUIRED" ? 401 : reason === "FORBIDDEN" ? 403 : 422;
    return NextResponse.json({ status: "blocked", reason }, { status });
  }
}
