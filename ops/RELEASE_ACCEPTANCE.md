# ACE Exchange V6 — Release Acceptance

## Code-complete criteria in this package
- Deep navy/electric blue ACE Exchange identity.
- Full exchange/product route architecture.
- Protected account/admin/financial routes.
- Fail-closed provider adapters.
- Explicit production approval gates.
- Live-first market/network read surfaces without fabricated balances or trades.
- Security headers, robots/sitemap, metadata, OG image and error boundaries.
- Route, source-security and environment audits.
- Reference double-entry ledger schema and operational runbooks.

## External blockers that source code cannot complete
- Production database account/credentials and backup policy.
- Auth/MFA provider account and verified email/SMS configuration.
- KYC/AML/sanctions/transaction-monitoring contracts and credentials.
- Custody/signing infrastructure and operational policy.
- Trading/liquidity/matching arrangement.
- Fiat banking/payment rails.
- Card issuer/program manager/processor approval.
- Legal/regulatory approvals and jurisdiction launch decision.
- Production security review / penetration testing.

These blockers must never be represented as completed by UI alone.
