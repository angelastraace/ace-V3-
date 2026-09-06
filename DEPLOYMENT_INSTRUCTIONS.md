# Deploy ACE Exchange V6

## v0 / Vercel
1. Import the entire ZIP as one project.
2. Do not replace `app/page.tsx` with an older homepage.
3. Install dependencies from `package.json`.
4. Run `npm run verify`.
5. Fix any platform-specific build issue before publishing.
6. Deploy to a Preview URL first.
7. Verify `/`, `/markets`, `/trading`, `/wallet`, `/card`, `/governance`, `/community`, `/creator`, `/ai`, `/status` and protected `/admin/launch-readiness`.
8. Confirm unauthenticated protected pages redirect to `/login` and protected financial APIs return `401`.
9. Keep all real-money feature flags false unless their providers and approval gates are genuinely complete.
10. Promote the verified Preview deployment to Production.

## Domain
Set `NEXT_PUBLIC_APP_URL` and Next metadata/canonical domain to the final ACE Exchange production domain before public indexing. The package currently targets `https://www.aceexchange.io`.

## Required final build validation
Because the artifact-generation environment could not resolve npm registry DNS, perform a fresh dependency installation and `npm run verify` in v0/Vercel before production promotion.
