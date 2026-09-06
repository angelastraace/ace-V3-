# ACE Exchange V6 — Go-Live Runbook

## Phase 0 — Code / deployment
1. Deploy V6 as Preview.
2. Run `npm run verify` in the connected build environment.
3. Confirm `/api/health/live` returns 200.
4. Confirm all 97 app routes build; protected routes redirect/401 when unauthenticated.
5. Confirm secrets are Production-only Vercel environment variables and never present in client bundles.
6. Confirm `ENABLE_*` financial flags remain false.

## Phase 1 — Controlled account beta
1. Configure database, auth, email, monitoring, audit and distributed rate limiting.
2. Verify MFA/passkey/session/verification flows with clean accounts.
3. Set `CONTROLLED_BETA_APPROVED=true` only after owner sign-off.
4. Set `ENABLE_REGISTRATION=true` only when onboarding is intentionally opened.
5. Leave all financial `ENABLE_*` flags false.
6. Validate `/admin/launch-readiness` via protected admin access and `/api/admin/readiness` via internal token.

## Phase 2 — Financial sandbox / test environment
1. Connect KYC, AML, custody, ledger, market data and execution providers in non-production mode.
2. Test deposit/withdraw/order state machines, idempotency, webhooks, reconciliation and failure recovery.
3. Complete security review and operational incident exercises.

## Phase 3 — Controlled mainnet
1. Confirm contracts/authorizations and jurisdiction rules for every enabled service.
2. Configure production provider endpoints and restricted production credentials.
3. Confirm custody signing policy, withdrawal limits, reconciliation and emergency disable controls.
4. Set `LEGAL_LAUNCH_APPROVED=true`, `OPERATIONS_LAUNCH_APPROVED=true`, and `SECURITY_LAUNCH_APPROVED=true` only after real sign-off.
5. Enable ONE financial feature at a time, with low limits and monitored users.
6. Verify real provider receipts/transaction IDs before expanding access.

## Phase 4 — Public launch
Only classify `READY FOR PUBLIC LAUNCH` when `/admin/launch-readiness` is green for all critical dependencies, explicit approval gates are true, production providers are healthy, and the enabled financial flags correspond to services that are genuinely approved and operational.
