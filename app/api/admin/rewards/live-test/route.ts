import { NextResponse } from "next/server";
import { getFinancialPool } from "../../../../../lib/db/pool";
import { requireAdmin } from "../../../../../lib/server-auth";
import { adminLiveClaims, verifyManualSettlement, liveRewardTestEnabled } from "../../../../../lib/reward-live-test";

export async function GET() {
  if (!liveRewardTestEnabled()) return NextResponse.json({ status: "blocked", reason: "LIVE_REWARD_TEST_DISABLED" }, { status: 503 });
  try {
    await requireAdmin();
    const pool = getFinancialPool();
    if (!pool) return NextResponse.json({ status: "blocked", reason: "FINANCIAL_DATABASE_CONFIGURATION_REQUIRED" }, { status: 503 });
    return NextResponse.json({ status: "ok", claims: await adminLiveClaims(pool) }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "CLAIMS_UNAVAILABLE";
    return NextResponse.json({ status: "blocked", reason }, { status: reason === "FORBIDDEN" ? 403 : 401 });
  }
}

export async function POST(request: Request) {
  if (!liveRewardTestEnabled()) return NextResponse.json({ status: "blocked", reason: "LIVE_REWARD_TEST_DISABLED" }, { status: 503 });
  try {
    const admin = await requireAdmin();
    const pool = getFinancialPool();
    if (!pool) return NextResponse.json({ status: "blocked", reason: "DATABASE_UNAVAILABLE" }, { status: 503 });
    const body = await request.json().catch(() => null) as { claimId?: unknown; txHash?: unknown } | null;
    if (typeof body?.claimId !== "string" || typeof body.txHash !== "string") return NextResponse.json({ status: "invalid_request" }, { status: 400 });
    return NextResponse.json(await verifyManualSettlement(pool, admin.userId, body.claimId, body.txHash), { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "SETTLEMENT_REJECTED";
    const status = reason === "AUTHENTICATION_REQUIRED" ? 401 : reason === "FORBIDDEN" ? 403 : 422;
    return NextResponse.json({ status: "blocked", reason }, { status });
  }
}
