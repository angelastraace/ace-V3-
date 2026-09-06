# ACE Exchange V6 — Provider Adapter Contracts

V6 expects ACE-controlled adapter services between the web app and external vendors. This keeps vendor-specific payloads, signing schemes and secrets out of the frontend.

All production adapter URLs must use HTTPS. Every adapter should return JSON and support request IDs.

## Authentication adapter
Base: `AUTH_SERVICE_URL`

Expected endpoints:
- `POST /register`
- `POST /login`
- `POST /logout`
- `GET /session`
- `POST /forgot-password`
- `POST /reset-password`
- `POST /verify-email`
- `GET /health`

`GET /session` should return a minimal structure such as:
```json
{"authenticated":true,"user":{"id":"..."},"roles":["user"]}
```
Never return provider secrets or password hashes.

## Rate-limit adapter
Base: `RATE_LIMIT_SERVICE_URL`

`POST /check`
```json
{"bucket":"auth:login","ip":"203.0.113.10"}
```
Return `200` when allowed or `429` with `Retry-After` when blocked. If the service is unavailable, V6 sensitive endpoints fail closed.

## Market-data adapter
Base: `MARKET_DATA_PROVIDER_URL`

`GET /markets?symbols=BTC-USD,ETH-USD,SOL-USD`
```json
{"markets":[{"symbol":"BTC/USD","name":"Bitcoin","price":123.45,"change":1.2}]}
```

`GET /quote?symbol=BTC-USD`
```json
{"symbol":"BTC-USD","price":123.45,"bid":123.44,"ask":123.46,"volume":1000}
```

`GET /health`

The public fallback in V6 is discovery-only and must never be treated as an executable quote.

## Ledger adapter
Base: `LEDGER_SERVICE_URL`

Expected endpoints:
- `GET /balances`
- `GET /transactions`
- `GET /health`

The ledger service must be the authoritative source for available/locked/pending balances. Never derive authoritative balances from browser state.

## Custody adapter
Base: `CUSTODY_API_URL`

Expected endpoints:
- `POST /deposits/address`
- `POST /withdrawals`
- `GET /health`

Withdrawal signing/private keys must remain in qualified custody/HSM/MPC infrastructure, never in the web project.

## Trading/execution adapter
Base: `TRADING_EXECUTION_URL`

Expected endpoints:
- `GET /orders`
- `POST /orders`
- `POST /orders/{id}/cancel`
- `GET /health`

Financial mutations require `Idempotency-Key`. The adapter must enforce balance locks and order-state transitions atomically with the ledger/orchestration layer.

## KYC adapter
Base: `KYC_PROVIDER_URL`

Expected endpoints:
- `POST /session`
- `GET /health`

The ACE adapter should normalize the selected KYC vendor's session/status model. Vendor webhooks must be verified server-side outside the browser.

## AML adapter
Base: `AML_PROVIDER_URL`

Expected endpoint:
- `GET /health`

AML/sanctions/transaction monitoring should be invoked by the backend orchestration layer for account and financial events. Do not expose sensitive screening logic to clients.

## Fiat adapter
Base: `FIAT_PROVIDER_URL`

Expected endpoints:
- `POST /quote`
- `GET /health`

Fiat actions remain disabled until banking/payment rails and legal approvals are complete.

## Card adapter
Base: `CARD_PROVIDER_URL`

Expected endpoints:
- `GET /status`
- `POST /applications`
- `GET /health`

The adapter must sit in front of the approved issuer/program manager/processor. Never store raw PAN/CVV data in ACE application storage.

## Governance adapter
Base: `GOVERNANCE_API_URL`
- `GET /proposals`
- `POST /votes`
- `GET /health`

## Community adapter
Base: `COMMUNITY_API_URL`
- `GET /feed`
- `POST /posts`
- `GET /health`

## Creator adapter
Base: `CREATOR_API_URL`
- `GET /profile`
- `POST /payouts`
- `GET /health`

Creator payouts require KYC/AML plus explicit production approval gates.

## Audit adapter
Base: `AUDIT_SERVICE_URL`
- `GET /health`
- production event-ingestion endpoint selected by the implementation team

Audit persistence should be append-only/immutable to normal application/admin users.
