# ACE Exchange V6 — Incident Response Skeleton

## Severity
- SEV-1: unauthorized financial movement, credential/key compromise, ledger/custody mismatch, broad auth bypass.
- SEV-2: financial provider outage, withdrawal/deposit processing failure, major account-access failure.
- SEV-3: degraded non-financial functionality, isolated UI/API errors.

## Immediate actions for SEV-1
1. Disable affected financial feature flags.
2. Suspend withdrawal/trading provider routes as appropriate.
3. Preserve logs, request IDs, audit events and provider references.
4. Rotate affected credentials through the provider/Vercel secret store.
5. Reconcile internal ledger against custody/external provider records.
6. Escalate to legal/compliance/security owners under the organization’s formal incident plan.

## Recovery
- Restore only after root cause is understood, data/ledger integrity is verified, credentials are rotated where required, and the responsible owner explicitly approves re-enable.
- Re-enable one capability at a time.
