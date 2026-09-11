# Better Auth Transition Compatibility Map

## Existing contract retained in Phase 3A.1

| Surface | Legacy behavior | Phase 3A.1 behavior |
|---|---|---|
| Browser forms | `AuthForm` and `AuthRecoveryForm` call the existing `/api/auth/*` routes | Unchanged; no UI or route-contract change |
| Legacy API routes | `login`, `logout`, `session`, `forgot-password`, `reset-password`, and `verify-email` proxy to `AUTH_SERVICE_URL` | Retained unchanged for `AUTH_MODE=legacy` |
| Registration | `/api/auth/register` previously proxied only when enabled | Public registration is always blocked; Better Auth direct sign-up endpoints are also blocked |
| Protected pages/APIs | `proxy.ts` validates a session and redirects pages or returns 401 for APIs | `proxy.ts` calls `currentServerSession`; default mode retains legacy validation |
| Roles/admin | Legacy session supplies `roles`; `AUTH_ADMIN_ROLES` and `ENABLE_ADMIN_DASHBOARD` gate admin access | Retained; Better Auth mode reads roles from `user_roles`, so absent roles deny admin access |

## New server-only boundary

`lib/server-auth.ts` selects exactly one mode:

- `AUTH_MODE=legacy` (default): validates with `AUTH_SERVICE_URL`, `AUTH_SERVICE_TOKEN`, and `AUTH_SESSION_PATH`.
- `AUTH_MODE=better-auth`: validates Better Auth sessions backed by Neon.

A Better Auth configuration failure returns an unauthenticated result. It never falls back to the legacy transport. The new `/api/auth/[...betterAuth]` handler exposes Better Auth endpoints only after configuration is complete and explicitly blocks every direct sign-up path.

## Cutover prerequisites

1. Connect [Neon](https://vercel.com/marketplace/neon/neon) and set the required server-only variables. `BETTER_AUTH_DATABASE_URL` must be a pooled URL authenticated as `ace_exchange_runtime`, not the owner/integration URL.
2. Apply the additive migrations through `pnpm db:migrate` from a trusted environment using a direct Neon connection.
3. Test an invited/pre-provisioned user sign-in, session persistence, recovery email integration, role assignment, and admin authorization in Preview.
4. Replace the broad `AUTH_MODE` record with Production `legacy` and Preview branch `vercel-agent/ace-exchange-preview-auth-test` `better-auth`; keep `BETTER_AUTH_URL` absent in Preview.
5. Provision Preview-only accounts through `pnpm preview:user:create -- --email <email> --role user|admin` from that Preview execution context, with `ACE_PREVIEW_USER_PASSWORD` supplied outside source control.

No existing `AUTH_SERVICE_URL` variable or route has been removed in this phase.
