# ACE Exchange V6 — Security Checklist

- [ ] Production authentication uses secure, HttpOnly, SameSite cookies.
- [ ] MFA / step-up authentication enabled for withdrawals and admin actions.
- [ ] Admin access enforced server-side with least-privilege RBAC.
- [ ] Distributed rate limiting configured for login, registration and financial endpoints.
- [ ] Financial mutation APIs require user session, same-origin browser request and idempotency key.
- [ ] Custody/signing private keys never enter the web application or Vercel client bundle.
- [ ] Provider secrets exist only in server-side Production environment variables.
- [ ] Withdrawal destination validation and network validation occur at custody/risk layer.
- [ ] KYC/AML/sanctions checks gate regulated financial flows.
- [ ] Persistent audit trail configured and protected from normal admin mutation.
- [ ] Monitoring/alerting configured for auth, provider, ledger, custody and reconciliation failures.
- [ ] Backups and restore test completed for production database.
- [ ] CSP/security headers reviewed after final provider domains are known.
- [ ] Dependency vulnerability scan completed in connected CI/build environment.
- [ ] Penetration test / independent security review completed before public real-money launch.
- [ ] Incident-response contacts and disable/rollback procedures exercised.
