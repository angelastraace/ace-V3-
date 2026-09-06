# ACE Exchange V6 Merge Notes

V6 was derived from `ACE_Exchange_V5_Launch_Ready_Integration_Package.zip` and the later full-route merge requirements.

Major V6 hardening additions:
- Deep-blue ACE Exchange design retained and normalized across internal surfaces.
- Missing legal aliases and dynamic governance proposal route retained.
- Protected financial API routing added, not only protected pages.
- Explicit registration gate and account-core readiness requirement.
- Password recovery and email-verification lifecycle surfaces/APIs.
- Wallet balances/history, order history/cancel, KYC session, card application, governance vote, community post and creator payout adapters.
- Financial mutations require idempotency key and same-origin browser requests.
- Distributed rate-limit adapter required for sensitive production endpoints.
- Explicit legal/operations/security/provider-validation gates prevent false public-launch status.
- Production market-data adapter preferred over public read-only fallback.
- Provider health diagnostics and operational runbooks added.
- Reference PostgreSQL double-entry ledger schema added.
- Homepage account CTAs corrected to `/login` and `/register`; footer Support corrected.

No regulated provider, custody relationship, card-issuing relationship or license is fabricated by this package.
