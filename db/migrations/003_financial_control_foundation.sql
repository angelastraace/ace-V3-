-- V4A additive financial persistence foundation. Apply only via approved non-production migrator.
CREATE TABLE IF NOT EXISTS ledger_accounts_financial (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL, currency text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS ledger_transactions_financial (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), transaction_type text NOT NULL, reference text UNIQUE NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS ledger_entries_financial (id bigserial PRIMARY KEY, transaction_id uuid NOT NULL REFERENCES ledger_transactions_financial(id) ON DELETE RESTRICT, account_id uuid NOT NULL REFERENCES ledger_accounts_financial(id) ON DELETE RESTRICT, direction text NOT NULL CHECK(direction IN ('debit','credit')), amount numeric(38,18) NOT NULL CHECK(amount>0), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS idempotency_records_financial (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), scope text NOT NULL, key text NOT NULL, request_hash text NOT NULL, result_reference text, created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz, UNIQUE(scope,key));
CREATE TABLE IF NOT EXISTS financial_audit_events (id bigserial PRIMARY KEY,event_type text NOT NULL,actor_user_id text NOT NULL,actor_role text NOT NULL,entity_type text NOT NULL,entity_id text NOT NULL,metadata_safe jsonb NOT NULL DEFAULT '{}'::jsonb,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS reward_funding_sources_financial (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS reward_programs_financial (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS reward_backing_allocations_financial (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS reward_accruals_financial (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS reward_claims_financial (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS reward_claim_reservations_financial (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS settlement_plans_financial (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS settlement_routes_financial (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS custody_webhook_events (id bigserial PRIMARY KEY, provider text NOT NULL, event_id text NOT NULL, received_at timestamptz NOT NULL DEFAULT now(), UNIQUE(provider,event_id));

CREATE OR REPLACE FUNCTION ace_reject_financial_history_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'financial history is append-only'; END; $$;
CREATE OR REPLACE FUNCTION ace_assert_financial_ledger_balanced(p_transaction_id uuid) RETURNS void LANGUAGE plpgsql AS $$ DECLARE deb numeric; cred numeric; BEGIN SELECT COALESCE(sum(amount) FILTER(WHERE direction='debit'),0),COALESCE(sum(amount) FILTER(WHERE direction='credit'),0) INTO deb,cred FROM ledger_entries_financial WHERE transaction_id=p_transaction_id; IF deb=0 OR deb<>cred THEN RAISE EXCEPTION 'ledger transaction % is not balanced',p_transaction_id; END IF; END; $$;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='ledger_transactions_financial_append_only') THEN CREATE TRIGGER ledger_transactions_financial_append_only BEFORE UPDATE OR DELETE ON ledger_transactions_financial FOR EACH ROW EXECUTE FUNCTION ace_reject_financial_history_mutation(); END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='ledger_entries_financial_append_only') THEN CREATE TRIGGER ledger_entries_financial_append_only BEFORE UPDATE OR DELETE ON ledger_entries_financial FOR EACH ROW EXECUTE FUNCTION ace_reject_financial_history_mutation(); END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='financial_audit_events_append_only') THEN CREATE TRIGGER financial_audit_events_append_only BEFORE UPDATE OR DELETE ON financial_audit_events FOR EACH ROW EXECUTE FUNCTION ace_reject_financial_history_mutation(); END IF;
END $$;
REVOKE UPDATE, DELETE, TRUNCATE ON ledger_transactions_financial, ledger_entries_financial, financial_audit_events FROM PUBLIC;
