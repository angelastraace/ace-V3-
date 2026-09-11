# ACE Exchange V6 — Launch Candidate

**Trade. Create. Connect.**

ACE Exchange V6 is the most complete integration-ready source package for the ACE Exchange platform. It contains the public exchange experience, protected account surfaces, provider-gated financial APIs, governance/community/creator modules, card surfaces, admin launch-readiness tooling, security controls and operational runbooks.

## What V6 means

V6 is **code-complete as a launch candidate**, not a claim that regulated financial services are already approved or connected. Real-money actions fail closed until real production providers, credentials and explicit launch approvals are configured.

## Local / connected build

```bash
npm install
npm run verify
npm run dev
```

`npm run verify` performs TypeScript checking, the Next.js production build, route/security/environment/link audits and route reporting.

## Production deployment

1. Import the complete project into v0/Vercel or Git.
2. Configure values from `.env.example` as Vercel Production Environment Variables. Never commit secrets.
3. Run `npm run verify` in the connected build environment.
4. Deploy as Preview first and test all critical routes.
5. Configure account infrastructure before enabling registration.
6. Keep every financial `ENABLE_*` flag false until the corresponding production provider and approval gates are verified.
7. Review `/admin/launch-readiness` and protected `/api/admin/readiness` before any controlled rollout.
8. Promote the verified Preview deployment to Production.

## Release controls

Public financial launch requires explicit production approval gates:

- `CONTROLLED_BETA_APPROVED`
- `LEGAL_LAUNCH_APPROVED`
- `OPERATIONS_LAUNCH_APPROVED`
- `SECURITY_LAUNCH_APPROVED`
- `FINANCIAL_PROVIDER_VALIDATION_APPROVED`

They default to `false`.

## Key files

- `.env.example` — complete integration/feature/approval template.
- `BETA_STACK.md` — selected controlled-beta providers and provisioning contract.
- `db/schema.sql` — PostgreSQL reference model for users, assets, ledger, deposits, withdrawals, orders, trades, idempotency and audit.
- `ROUTE_MAP.md` — generated route inventory.
- `PRODUCTION_READINESS.md` — source-vs-provider readiness boundary.
- `ops/GO_LIVE_RUNBOOK.md` — staged launch procedure.
- `ops/SECURITY_CHECKLIST.md` — security acceptance checklist.
- `ops/PROVIDER_MATRIX.md` — provider dependencies and adapters.
- `ops/INCIDENT_RESPONSE.md` — incident-response skeleton.
- `ops/RELEASE_ACCEPTANCE.md` — release acceptance criteria.
- `RELEASE_MANIFEST.json` — checksums for the frozen source package.

## Design

ACE Exchange uses the approved deep-navy / electric-blue / cyan identity and remains visually distinct from ACE Trading Frameworks.
