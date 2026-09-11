# Controlled Beta Stack

ACE Exchange is prepared to integrate the following controlled-account-beta stack. This document records the configuration contract without enabling registration or any financial feature.

| Capability | Selected provider | Required Vercel variables | Status in this source |
|---|---|---|---|
| Relational data | Neon Postgres | `DATABASE_URL` | Schema reference exists; application data access is not yet implemented |
| Identity | Clerk | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Requires the `@clerk/nextjs` SDK migration before activation |
| Transactional email | Resend | `RESEND_API_KEY`, `EMAIL_FROM` | Requires the `resend` SDK and verified sending domain before activation |
| Error monitoring | Sentry | `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` | Requires Sentry Next.js SDK initialization before activation |
| Distributed rate limiting | Upstash Redis | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Requires the Upstash SDK implementation before activation |

## Provisioning order

1. Add Neon, Clerk, Resend, Sentry, and Upstash to the Vercel project. Marketplace connections provision project-scoped credentials where supported.
2. Add the variables above as Production and Preview variables. `EMAIL_FROM` must use a verified Resend domain.
3. Implement and validate each SDK migration in a Preview deployment. Do not rely on variable presence alone as proof of a working provider integration.
4. Configure the persistent audit service and internal readiness token.
5. Run `npm run verify`, then test authentication, email delivery, rate limiting, and error capture with real test accounts.
6. Keep `ENABLE_REGISTRATION=false` and every financial `ENABLE_*` flag `false` until the stack is tested and controlled-beta approval is recorded.

## Vercel provider references

- [Neon Marketplace integration](https://vercel.com/marketplace/neon/neon)
- [Clerk Marketplace integration](https://vercel.com/marketplace/clerk/clerk)
- [Resend Marketplace integration](https://vercel.com/marketplace/resend)
- [Sentry Marketplace integration](https://vercel.com/marketplace/sentry/sentry)
- [Upstash Marketplace integration](https://vercel.com/marketplace/upstash/upstash-kv)

Vercel Postgres and Vercel KV are no longer first-party products; their existing stores were migrated to Neon and Upstash Redis through the Vercel Marketplace in December 2024.
