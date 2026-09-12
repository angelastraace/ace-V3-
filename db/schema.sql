-- ACE Exchange V6 — PostgreSQL reference schema
-- This is a provider-neutral reference for the authoritative data/ledger model.
-- Apply only after review/migrations are integrated with the selected production database.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_auth_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','restricted','suspended','closed')),
  kyc_status text NOT NULL DEFAULT 'not_started' CHECK (kyc_status IN ('not_started','pending','verified','rejected','needs_information')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text UNIQUE NOT NULL,
  name text NOT NULL,
  precision smallint NOT NULL CHECK (precision BETWEEN 0 AND 30),
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE RESTRICT,
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  account_type text NOT NULL CHECK (account_type IN ('user_available','user_locked','user_pending','platform_fee','custody','settlement','clearing','treasury')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','frozen','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (user_id, asset_id, account_type)
);

CREATE TABLE IF NOT EXISTS ledger_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_ref text UNIQUE,
  idempotency_key text UNIQUE NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('deposit','withdrawal','trade','fee','conversion','transfer','card','refund','adjustment')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','posted','reversed','failed')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  posted_at timestamptz
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id bigserial PRIMARY KEY,
  transaction_id uuid NOT NULL REFERENCES ledger_transactions(id) ON DELETE RESTRICT,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  direction text NOT NULL CHECK (direction IN ('debit','credit')),
  amount numeric(38,18) NOT NULL CHECK (amount > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ledger_entries_tx_idx ON ledger_entries(transaction_id);
CREATE INDEX IF NOT EXISTS ledger_entries_account_idx ON ledger_entries(account_id, created_at DESC);

CREATE TABLE IF NOT EXISTS deposit_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  network text NOT NULL,
  address text NOT NULL,
  provider_ref text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(network,address)
);

CREATE TABLE IF NOT EXISTS deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  network text NOT NULL,
  tx_hash text NOT NULL,
  amount numeric(38,18) NOT NULL CHECK (amount > 0),
  confirmations integer NOT NULL DEFAULT 0 CHECK (confirmations >= 0),
  status text NOT NULL CHECK (status IN ('detected','confirming','credited','rejected')),
  ledger_transaction_id uuid REFERENCES ledger_transactions(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(network,tx_hash)
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  network text NOT NULL,
  destination text NOT NULL,
  amount numeric(38,18) NOT NULL CHECK (amount > 0),
  fee numeric(38,18) NOT NULL DEFAULT 0 CHECK (fee >= 0),
  status text NOT NULL CHECK (status IN ('requested','screening','approved','signing','broadcast','confirming','completed','rejected','cancelled')),
  provider_ref text,
  tx_hash text,
  ledger_transaction_id uuid REFERENCES ledger_transactions(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  idempotency_key text UNIQUE NOT NULL,
  market text NOT NULL,
  side text NOT NULL CHECK (side IN ('buy','sell')),
  order_type text NOT NULL CHECK (order_type IN ('market','limit','stop_market','stop_limit')),
  quantity numeric(38,18) NOT NULL CHECK (quantity > 0),
  limit_price numeric(38,18),
  stop_price numeric(38,18),
  status text NOT NULL CHECK (status IN ('new','accepted','open','partially_filled','filled','cancelled','rejected','expired')),
  external_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_user_created_idx ON orders(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  market text NOT NULL,
  quantity numeric(38,18) NOT NULL CHECK (quantity > 0),
  price numeric(38,18) NOT NULL CHECK (price > 0),
  fee numeric(38,18) NOT NULL DEFAULT 0 CHECK (fee >= 0),
  external_ref text UNIQUE,
  ledger_transaction_id uuid REFERENCES ledger_transactions(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS idempotency_records (
  key text PRIMARY KEY,
  scope text NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE RESTRICT,
  request_hash text NOT NULL,
  response_status integer,
  response_body jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_events (
  id bigserial PRIMARY KEY,
  actor_id text,
  actor_type text NOT NULL CHECK (actor_type IN ('user','admin','service','system')),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  request_id text,
  ip_hash text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_events_created_idx ON audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_events_resource_idx ON audit_events(resource_type, resource_id, created_at DESC);


-- Liquidity router V1: simulation-only reference entities. No provider credentials or custody keys are stored.
CREATE TABLE IF NOT EXISTS reward_backing_sources (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_type text NOT NULL CHECK (source_type IN ('PROTOCOL_REVENUE','SPONSOR','PARTNER','TREASURY','CREDIT')), approved_amount numeric(38,18) NOT NULL CHECK (approved_amount >= 0), allocated_amount numeric(38,18) NOT NULL DEFAULT 0 CHECK (allocated_amount >= 0), status text NOT NULL CHECK (status IN ('pending','approved','cancelled')), created_at timestamptz NOT NULL DEFAULT now(), CHECK (allocated_amount <= approved_amount));
CREATE TABLE IF NOT EXISTS reward_accruals (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id), backing_source_id uuid NOT NULL REFERENCES reward_backing_sources(id), amount_usd numeric(38,18) NOT NULL CHECK (amount_usd > 0), state text NOT NULL CHECK (state IN ('EARNED','VESTED','RESERVED','CLAIM_PENDING','CLAIMED','CANCELLED')), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS reward_claims (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id), idempotency_key text UNIQUE NOT NULL, target_asset text NOT NULL, amount_usd numeric(38,18) NOT NULL CHECK (amount_usd > 0), state text NOT NULL CHECK (state IN ('RESERVED','CLAIM_PENDING','CLAIMED','CANCELLED')), simulation_only boolean NOT NULL DEFAULT true CHECK (simulation_only), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS liquidity_quotes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), provider text NOT NULL, token_in text NOT NULL, token_out text NOT NULL, quote jsonb NOT NULL, simulation_only boolean NOT NULL DEFAULT true CHECK (simulation_only), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS settlement_plans (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reward_claim_id uuid NOT NULL REFERENCES reward_claims(id), simulation_only boolean NOT NULL DEFAULT true CHECK (simulation_only), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS settlement_routes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), settlement_plan_id uuid NOT NULL REFERENCES settlement_plans(id), provider text NOT NULL, route jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());

COMMIT;

-- IMPORTANT: application logic must enforce that every POSTED ledger transaction
-- balances debits and credits per asset. Prefer a dedicated ledger service with
-- serializable transactions and reconciliation against custody/provider balances.
