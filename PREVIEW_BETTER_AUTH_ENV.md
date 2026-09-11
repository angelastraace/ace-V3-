# Preview Better Auth environment plan

Do not assign Better Auth secrets until the code preview has been deployed.

| Scope | Variable | Value |
| --- | --- | --- |
| Production | `AUTH_MODE` | `legacy` |
| Preview branch `vercel-agent/ace-exchange-preview-auth-test` | `AUTH_MODE` | `better-auth` |
| Preview branch `vercel-agent/ace-exchange-preview-auth-test` | `BETTER_AUTH_DATABASE_URL` | Restricted pooled Neon URL using `ace_exchange_runtime` |
| Preview branch `vercel-agent/ace-exchange-preview-auth-test` | `BETTER_AUTH_SECRET` | Preview-only secret |

`BETTER_AUTH_URL` must remain absent in Preview: the origin is derived from `VERCEL_URL`. Leave the generic `DATABASE_URL` unchanged. Remove the current all-environment `AUTH_MODE` record before adding the production and branch-scoped records.

The preview database bootstrap SQL grants `ace_exchange_runtime` the `INSERT` privilege on `user_roles`, which is required by the preview-only provisioner. Apply that SQL separately in Neon; this repository change does not alter Neon.
