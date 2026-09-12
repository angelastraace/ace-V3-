import crypto from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { FinancialRepository } from "./db/repositories/financial";

export const BASE_CHAIN_ID = 8453;
export const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const MAX_USD = 5;

export function liveRewardTestEnabled() {
  return process.env.NODE_ENV === "development" && process.env.ACE_LIVE_REWARD_TEST_ENABLED === "true" && process.env.ACE_REWARD_EXECUTION_MODE === "manual-live-test" && process.env.VERCEL_ENV !== "production" && process.env.VERCEL_ENV !== "preview";
}

function assertLiveMode() {
  if (!liveRewardTestEnabled()) throw new Error("LIVE_REWARD_TEST_DISABLED");
  const configuredMax = Number(process.env.ACE_LIVE_REWARD_MAX_USD || MAX_USD);
  if (!Number.isFinite(configuredMax) || configuredMax <= 0 || configuredMax > MAX_USD) throw new Error("LIVE_REWARD_LIMIT_INVALID");
  return configuredMax;
}

function wallet(value: unknown) {
  if (typeof value !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(value)) throw new Error("BASE_WALLET_REQUIRED");
  return value.toLowerCase();
}

function amount(value: unknown, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 1 || value > max) throw new Error("REWARD_AMOUNT_LIMIT");
  return value;
}

function safeJson(value: unknown) {
  return JSON.stringify(value);
}

async function account(client: PoolClient, code: string) {
  const result = await client.query<{ id: string }>("INSERT INTO ledger_accounts_financial(code,currency) VALUES($1,'USD') ON CONFLICT(code) DO UPDATE SET code=EXCLUDED.code RETURNING id", [code]);
  return result.rows[0].id;
}

export async function createLivePilot(pool: Pool, userId: string, destinationWallet: unknown, requestedAmount: unknown, idempotencyKey: string) {
  const max = assertLiveMode();
  const destination = wallet(destinationWallet);
  const claimAmount = amount(requestedAmount, max);
  if (!idempotencyKey || idempotencyKey.length > 200) throw new Error("IDEMPOTENCY_KEY_REQUIRED");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const repo = new FinancialRepository(client);
    const requestHash = crypto.createHash("sha256").update(`${userId}:${destination}:${claimAmount}`).digest("hex");
    const prior = await repo.idempotency("reward-live-pilot", idempotencyKey, requestHash);
    if (prior.replayed) { await client.query("ROLLBACK"); return { status: "replayed", claimId: prior.resultReference }; }
    const existing = await client.query<{ id: string }>("SELECT id FROM reward_claims_financial WHERE data->>'userId'=$1 AND data->>'executionMode'='manual-live-test' AND data->>'state' IN ('RESERVED','PAID') LIMIT 1 FOR UPDATE", [userId]);
    if (existing.rowCount) throw new Error("LIVE_REWARD_ALREADY_CLAIMED");
    const accrualResult = await client.query<{ id: string; data: Record<string, unknown> }>("SELECT id,data FROM reward_accruals_financial WHERE data->>'userId'=$1 AND data->>'state'='VESTED' AND (data->>'amountUsd')::numeric >= $2 LIMIT 1 FOR UPDATE", [userId, claimAmount]);
    const accrual = accrualResult.rows[0];
    if (!accrual) throw new Error("INSUFFICIENT_BACKING");
    const accrualId = accrual.id;
    const allocationId = String(accrual.data.allocationId);
    const sourceId = String(accrual.data.fundingSourceId);
    const claim = await repo.createClaim({ userId, accrualId, allocationId, fundingSourceId: sourceId, amountUsd: claimAmount, asset: "USDC", network: "base", destinationWallet: destination, executionMode: "manual-live-test", state: "RESERVED", settlementStatus: "AWAITING_TRANSFER" });
    const claimId = claim.rows[0].id;
    const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await client.query("UPDATE reward_claims_financial SET data = data || $2::jsonb WHERE id=$1", [claimId, safeJson({ reservationExpiresAt })]);
    const reservation = await repo.createReservation({ claimId, amountUsd: claimAmount, status: "active", quoteExpiresAt: reservationExpiresAt });
    const plan = await repo.createSettlementPlan({ claimId, status: "AWAITING_TRANSFER", executionMode: "manual-live-test", asset: "USDC", network: "base", destinationWallet: destination, amountUsd: claimAmount });
    await repo.createSettlementRoute({ settlementPlanId: plan.rows[0].id, provider: "MANUAL_TREASURY", route: { asset: "USDC", network: "base", destinationWallet: destination, amountUsd: claimAmount, status: "AWAITING_TRANSFER" } });
    await repo.audit("reward_live_claim_reserved", userId, "user", "reward_claim", claimId, { amountUsd: claimAmount, asset: "USDC", network: "base" });
    await repo.completeIdempotency("reward-live-pilot", idempotencyKey, claimId);
    await client.query("COMMIT");
    return { status: "reserved", claimId, reservationId: reservation.rows[0].id, amountUsd: claimAmount, asset: "USDC", network: "Base", chainId: BASE_CHAIN_ID, destinationWallet: destination, settlementStatus: "AWAITING_TRANSFER" };
  } catch (error) { await client.query("ROLLBACK").catch(() => undefined); throw error; } finally { client.release(); }
}

export async function latestLiveClaim(pool: Pool, userId: string) {
  const result = await pool.query<{ id: string; data: Record<string, unknown> }>("SELECT id,data FROM reward_claims_financial WHERE data->>'userId'=$1 AND data->>'executionMode'='manual-live-test' ORDER BY created_at DESC LIMIT 1", [userId]);
  return result.rows[0] ? { claimId: result.rows[0].id, ...result.rows[0].data } : null;
}

export async function adminLiveClaims(pool: Pool) {
  const result = await pool.query<{ id: string; data: Record<string, unknown> }>("SELECT id,data FROM reward_claims_financial WHERE data->>'executionMode'='manual-live-test' ORDER BY created_at DESC LIMIT 20");
  return result.rows.map(row => ({ claimId: row.id, ...row.data }));
}

export async function provisionPilot(pool: Pool, adminUserId: string, clientUserId: string, idempotencyKey: string) {
  const max = assertLiveMode();
  if (!clientUserId || !idempotencyKey || idempotencyKey.length > 200) throw new Error("IDEMPOTENCY_KEY_REQUIRED");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const repo = new FinancialRepository(client);
    const requestHash = crypto.createHash("sha256").update(`${adminUserId}:${clientUserId}:pilot`).digest("hex");
    const prior = await repo.idempotency("reward-live-pilot-provision", idempotencyKey, requestHash);
    if (prior.replayed) { await client.query("ROLLBACK"); return { status: "replayed", provisionId: prior.resultReference }; }
    const existing = await client.query("SELECT id FROM reward_funding_sources_financial WHERE data->>'name'='ACE Live Reward Pilot' AND data->>'status'='ACTIVE' LIMIT 1");
    if (existing.rowCount) throw new Error("LIVE_PILOT_ALREADY_PROVISIONED");
    const source = await repo.createFundingSource({ sourceType: "TREASURY", name: "ACE Live Reward Pilot", status: "ACTIVE", currency: "USD", approvedUsd: max, allocatedUsd: max, reservedUsd: 0, consumedUsd: 0, network: "base", asset: "USDC" });
    const sourceId = source.rows[0].id;
    const program = await repo.createRewardProgram({ name: "ACE Live Reward Pilot", type: "MANUAL_LIVE_TEST", status: "ACTIVE", currency: "USD", maxBudgetUsd: max, network: "base", asset: "USDC" });
    const programId = program.rows[0].id;
    const allocation = await repo.createAllocation({ fundingSourceId: sourceId, rewardProgramId: programId, approvedUsd: max, allocatedUsd: max, reservedUsd: 0, consumedUsd: 0 });
    const allocationId = allocation.rows[0].id;
    const accrual = await repo.createAccrual({ userId: clientUserId, rewardProgramId: programId, allocationId, fundingSourceId: sourceId, amountUsd: 1, state: "VESTED", asset: "USDC", network: "base", chainId: BASE_CHAIN_ID });
    const accrualId = accrual.rows[0].id;
    await repo.audit("reward_live_pilot_provisioned", adminUserId, "admin", "reward_accrual", accrualId, { amountUsd: 1, backingUsd: max, asset: "USDC", network: "base" });
    await repo.completeIdempotency("reward-live-pilot-provision", idempotencyKey, accrualId);
    await client.query("COMMIT");
    return { status: "provisioned", fundingSourceId: sourceId, rewardProgramId: programId, allocationId, accrualId, backingUsd: max, accrualUsd: 1 };
  } catch (error) { await client.query("ROLLBACK").catch(() => undefined); throw error; } finally { client.release(); }
}

export async function verifyManualSettlement(pool: Pool, adminUserId: string, claimId: string, txHash: unknown) {
  assertLiveMode();
  if (typeof txHash !== "string" || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) throw new Error("TRANSACTION_HASH_REQUIRED");
  const rpc = process.env.BASE_RPC_URL?.trim();
  if (!rpc) throw new Error("BASE_RPC_UNAVAILABLE");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const claimResult = await client.query<{ data: Record<string, unknown>; id: string }>("SELECT id,data FROM reward_claims_financial WHERE id=$1 FOR UPDATE", [claimId]);
    const claim = claimResult.rows[0];
    if (!claim || claim.data.state !== "RESERVED" || claim.data.settlementStatus !== "AWAITING_TRANSFER") throw new Error("CLAIM_NOT_SETTLEABLE");
    if (claim.data.reservationExpiresAt && Date.parse(String(claim.data.reservationExpiresAt)) <= Date.now()) throw new Error("CLAIM_EXPIRED");
    const duplicate = await client.query("SELECT 1 FROM settlement_plans_financial WHERE data->>'txHash'=$1 LIMIT 1", [txHash.toLowerCase()]);
    if (duplicate.rowCount) throw new Error("DUPLICATE_TRANSACTION_HASH");
    const rpcCall = async (method: string, params: unknown[]) => { const response = await fetch(rpc, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), signal: AbortSignal.timeout(8000) }); if (!response.ok) throw new Error("BASE_RPC_UNAVAILABLE"); const body = await response.json() as { result?: unknown; error?: unknown }; if (body.error || body.result === undefined) throw new Error("BASE_RPC_UNAVAILABLE"); return body.result as Record<string, unknown>; };
    const transaction = await rpcCall("eth_getTransactionByHash", [txHash]);
    const receipt = await rpcCall("eth_getTransactionReceipt", [txHash]);
    if (!transaction || !receipt || receipt.status !== "0x1") throw new Error("TRANSACTION_FAILED");
    const chainId = await rpcCall("eth_chainId", []);
    if (Number.parseInt(String(chainId), 16) !== BASE_CHAIN_ID) throw new Error("WRONG_CHAIN");
    const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    const logs = Array.isArray(receipt.logs) ? receipt.logs as Array<{ address?: string; topics?: string[]; data?: string }> : [];
    const expectedUnits = BigInt(Math.round(Number(claim.data.amountUsd) * 1_000_000));
    const match = logs.find(log => log.address?.toLowerCase() === BASE_USDC.toLowerCase() && log.topics?.[0] === transferTopic && log.topics?.[2] && `0x${log.topics[2].slice(-40)}`.toLowerCase() === String(claim.data.destinationWallet).toLowerCase() && BigInt(log.data || "0x0") === expectedUnits);
    if (!match) throw new Error("TRANSFER_MISMATCH");
    const repo = new FinancialRepository(client);
    await client.query("UPDATE reward_claims_financial SET data = data || $2::jsonb WHERE id=$1", [claimId, safeJson({ state: "PAID", settlementStatus: "SETTLED", txHash: txHash.toLowerCase() })]);
    await client.query("UPDATE reward_claim_reservations_financial SET status='released' WHERE reward_claim_id=$1 AND status='active'", [claimId]);
    await client.query("UPDATE reward_accruals_financial SET data = data || jsonb_build_object('state', 'CLAIMED', 'consumedUsd', $2::numeric) WHERE id = $1", [claim.data.accrualId, claim.data.amountUsd]);
    await client.query("UPDATE reward_backing_allocations_financial SET data = data || jsonb_build_object('consumedUsd', COALESCE((data->>'consumedUsd')::numeric, 0) + $2::numeric, 'reservedUsd', 0) WHERE id = $1", [claim.data.allocationId, claim.data.amountUsd]);
    await client.query("UPDATE reward_funding_sources_financial SET data = data || jsonb_build_object('consumedUsd', COALESCE((data->>'consumedUsd')::numeric, 0) + $2::numeric, 'reservedUsd', 0) WHERE id = $1", [claim.data.fundingSourceId, claim.data.amountUsd]);
    const backing = await account(client, "reward_backing_usdc_base");
    const payout = await account(client, "reward_payouts_usdc_base");
    await repo.postLedger("reward_manual_settlement", claimId, [{ accountId: backing, direction: "debit", amount: String(claim.data.amountUsd) }, { accountId: payout, direction: "credit", amount: String(claim.data.amountUsd) }]);
    await repo.audit("reward_live_claim_settled", adminUserId, "admin", "reward_claim", claimId, { txHash: txHash.toLowerCase(), asset: "USDC", network: "base" });
    await client.query("UPDATE settlement_plans_financial SET data = data || $2::jsonb WHERE data->>'claimId'=$1", [claimId, safeJson({ status: "SETTLED", txHash: txHash.toLowerCase() })]);
    await client.query("COMMIT");
    return { status: "settled", claimId };
  } catch (error) { await client.query("ROLLBACK").catch(() => undefined); throw error; } finally { client.release(); }
}