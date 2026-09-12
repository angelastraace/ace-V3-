-- Run only as the approved database administrator after V4A migrations, not from application runtime.
GRANT USAGE ON SCHEMA public TO ace_exchange_runtime;
GRANT SELECT, INSERT ON ledger_accounts_financial, ledger_transactions_financial, ledger_entries_financial, idempotency_records_financial, financial_audit_events, reward_funding_sources_financial, reward_programs_financial, reward_backing_allocations_financial, reward_accruals_financial, reward_claims_financial, reward_claim_reservations_financial, settlement_plans_financial, settlement_routes_financial, custody_webhook_events TO ace_exchange_runtime;
GRANT UPDATE (result_reference, completed_at) ON idempotency_records_financial TO ace_exchange_runtime;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ace_exchange_runtime;
-- No SUPERUSER, CREATEDB, CREATEROLE, BYPASSRLS, DROP, ownership, DELETE, or general UPDATE grants.
