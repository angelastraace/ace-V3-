import { NextResponse } from "next/server";
import { getFinancialPool } from "../../../../lib/db/pool";
import { getServerPrincipal } from "../../../../lib/server-auth";
import { createLivePilot, latestLiveClaim, liveRewardTestEnabled } from "../../../../lib/reward-live-test";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!liveRewardTestEnabled()) return NextResponse.json({ status: "blocked", reason: "LIVE_REWARD_TEST_DISABLED" }, { status: 503 });
  const principal = await getServerPrincipal();
  if (!principal) return NextResponse.json({ status: "unauthorized" }, { status: 401 });
  const pool = getFinancialPool();
  if (!pool) return NextResponse.json({ status: "blocked", reason: "FINANCIAL_DATABASE_CONFIGURATION_REQUIRED" }, { status: 503 });
  return NextResponse.json({ status: "ok", claim: await latestLiveClaim(pool, principal.userId), amountUsd: 1, asset: "USDC", network: "Base", chainId: 8453 }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  if (!liveRewardTestEnabled()) return NextResponse.json({ status: "blocked", reason: "LIVE_REWARD_TEST_DISABLED" }, { status: 503 });
  const principal = await getServerPrincipal();
  if (!principal) return NextResponse.json({ status: "unauthorized" }, { status: 401 });
  const key = request.headers.get("idempotency-key") || "";
  const body = await request.json().catch(() => null) as { amountUsd?: unknown; destinationWallet?: unknown } | null;
  try {
    const pool = getFinancialPool();
    if (!pool) throw new Error("DATABASE_UNAVAILABLE");
    return NextResponse.json(await createLivePilot(pool, principal.userId, body?.destinationWallet, body?.amountUsd, key), { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "CLAIM_REJECTED";
    const status = reason === "DATABASE_UNAVAILABLE" ? 503 : 422;
    return NextResponse.json({ status: "blocked", reason }, { status });
  }
}
