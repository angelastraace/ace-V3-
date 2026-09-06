# ACE Exchange V6 — Environment Variables

Configure secrets in Vercel Production Environment Variables. Never place real values in `.env.example` or source control.

## Public/non-secret
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_TERMS_VERSION`
- `NEXT_PUBLIC_PRIVACY_VERSION`
- feature flags / explicit approval gates (values themselves are not secrets, but should be controlled operationally)

## Secret/server-only
- database connection URL
- all provider service tokens/API keys
- internal status token
- monitoring DSN if the selected provider treats it as sensitive

## Launch order
1. Core account: database, auth, email, monitoring, audit, rate limiting.
2. Controlled-beta approval, then registration.
3. KYC/AML, custody, ledger, production market data.
4. Trading/liquidity.
5. Fiat.
6. Card.
7. Explicit legal/operations/security/provider-validation approvals.
8. Enable one financial feature flag at a time.

Never prefix server secrets with `NEXT_PUBLIC_`.
