# ACE Exchange V6 — Provider Matrix

The application is intentionally provider-neutral. Real-money functions stay disabled until production integrations are configured and verified.

| Capability | Required production dependency | V6 adapter | Default |
|---|---|---|---|
| Database | PostgreSQL-compatible production DB | `DATABASE_URL` + `db/schema.sql` reference | blocked |
| Identity/session | Auth service with secure cookies, MFA/passkeys support | `/api/auth/*`, `AUTH_SERVICE_*` | blocked |
| Email | Transactional email provider | `EMAIL_API_*` | blocked for account beta |
| Rate limiting | Distributed rate-limit/abuse service | `RATE_LIMIT_SERVICE_*` | fail-closed on sensitive endpoints |
| Monitoring | Error/APM provider | `MONITORING_DSN` | blocked for account beta |
| Audit | Append-only/persistent audit service | `AUDIT_SERVICE_*` | blocked for account beta |
| KYC | Production identity-verification provider | `KYC_PROVIDER_*` | blocked |
| AML/sanctions | Screening + transaction-monitoring provider | `AML_PROVIDER_*` | blocked |
| Custody | Qualified/approved custody or wallet infrastructure | `CUSTODY_API_*` | blocked |
| Ledger | Double-entry ledger service | `LEDGER_SERVICE_*` | blocked |
| Market data | SLA production market-data feed | `MARKET_DATA_PROVIDER_*` | public read-only fallback only |
| Trading/liquidity | Matching/liquidity/execution provider | `TRADING_EXECUTION_*` | blocked |
| Fiat | Approved banking/payment rails | `FIAT_PROVIDER_*` | blocked |
| Card | Issuer/program manager/processor | `CARD_PROVIDER_*` | blocked |
| Community | Persistent community backend | `COMMUNITY_API_*` | read-only shell |
| Governance | Persistent governance backend | `GOVERNANCE_API_*` | read-only shell |
| Creator | Creator/marketplace backend | `CREATOR_API_*` | payout blocked |

Never use a public blockchain RPC endpoint as custody, signing or authoritative balance infrastructure.
