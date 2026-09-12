-- ACE Exchange Preview-only Better Auth bootstrap for Neon SQL Editor.
-- Before execution: replace <ACE_EXCHANGE_RUNTIME_PASSWORD> inside the quoted string below.
-- After execution, construct BETTER_AUTH_DATABASE_URL with the pooled host/database from
-- ACE_NEON_DATABASE_URL, user ace_exchange_runtime, and that password. Do not reuse the owner URL.
-- This package has no DROP DATABASE, DROP SCHEMA, TRUNCATE, destructive ALTER,
-- financial/ledger mutation, or existing-data deletion statements.

BEGIN;

CREATE TABLE IF NOT EXISTS "user" (
  id text PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false, image text,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS session (
  id text PRIMARY KEY, "expiresAt" timestamptz NOT NULL, token text NOT NULL UNIQUE,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "ipAddress" text, "userAgent" text, "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS session_user_id_idx ON session("userId");
CREATE TABLE IF NOT EXISTS account (
  id text PRIMARY KEY, "accountId" text NOT NULL, "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE, "accessToken" text, "refreshToken" text,
  "idToken" text, "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, scope text,
  password text, "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS account_user_id_idx ON account("userId");
CREATE TABLE IF NOT EXISTS verification (
  id text PRIMARY KEY, identifier text NOT NULL, value text NOT NULL, "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS verification_identifier_idx ON verification(identifier);
CREATE TABLE IF NOT EXISTS user_roles (
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'admin', 'super_admin')),
  created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (user_id, role)
);
CREATE TABLE IF NOT EXISTS audit_events (
  id bigserial PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(), event_type text NOT NULL,
  actor_user_id text REFERENCES "user"(id) ON DELETE RESTRICT, actor_id text,
  actor_type text NOT NULL DEFAULT 'system' CHECK (actor_type IN ('user', 'admin', 'service', 'system')),
  request_id text, resource_type text, resource_id text, action text NOT NULL, result_status text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS audit_events_created_idx ON audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_events_resource_idx ON audit_events(resource_type, resource_id, created_at DESC);
CREATE OR REPLACE FUNCTION ace_reject_audit_event_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'audit_events is append-only'; END; $$;
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='audit_events_reject_mutation' AND tgrelid='audit_events'::regclass) THEN
  CREATE TRIGGER audit_events_reject_mutation BEFORE UPDATE OR DELETE ON audit_events FOR EACH ROW EXECUTE FUNCTION ace_reject_audit_event_mutation();
 END IF;
END; $$;
REVOKE UPDATE, DELETE, TRUNCATE ON audit_events FROM PUBLIC;

CREATE TABLE IF NOT EXISTS schema_migrations (id text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now());
DO $$
DECLARE expected_001 text := 'd4ad4d1642021e8319bfb8887a7c5aee9308006fb3fbb248865b4fc19b505b1f'; expected_002 text := '6bc65c80d7b11afdfca8a27317b9c1fd8a53352a3c300220b03bc8da0b7e720e';
BEGIN
 IF EXISTS (SELECT 1 FROM schema_migrations WHERE id='001_better_auth.sql' AND checksum<>expected_001) OR EXISTS (SELECT 1 FROM schema_migrations WHERE id='002_audit_events.sql' AND checksum<>expected_002) THEN RAISE EXCEPTION 'Applied migration checksum differs'; END IF;
 INSERT INTO schema_migrations (id,checksum) VALUES ('001_better_auth.sql',expected_001),('002_audit_events.sql',expected_002) ON CONFLICT (id) DO NOTHING;
END; $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='ace_exchange_runtime') THEN
  EXECUTE 'CREATE ROLE ace_exchange_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD ' || quote_literal('<ACE_EXCHANGE_RUNTIME_PASSWORD>');
 END IF;
 EXECUTE 'ALTER ROLE ace_exchange_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS';
 EXECUTE format('GRANT CONNECT ON DATABASE %I TO ace_exchange_runtime', current_database());
END; $$;
GRANT USAGE ON SCHEMA public TO ace_exchange_runtime;
REVOKE CREATE ON SCHEMA public FROM ace_exchange_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "user", session, account, verification TO ace_exchange_runtime;
GRANT SELECT, INSERT ON TABLE user_roles TO ace_exchange_runtime;
GRANT INSERT ON TABLE audit_events TO ace_exchange_runtime;
GRANT USAGE, SELECT ON SEQUENCE audit_events_id_seq TO ace_exchange_runtime;
REVOKE UPDATE, DELETE, TRUNCATE ON TABLE audit_events FROM ace_exchange_runtime;
COMMIT;

-- Verification queries: all should return the expected records/permissions.
SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN ('user','session','account','verification','user_roles','audit_events','schema_migrations') ORDER BY tablename;
SELECT id, checksum, applied_at FROM schema_migrations WHERE id IN ('001_better_auth.sql','002_audit_events.sql') ORDER BY id;
SELECT rolname, rolcanlogin, rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls FROM pg_roles WHERE rolname='ace_exchange_runtime';
SELECT table_name, privilege_type FROM information_schema.role_table_grants WHERE grantee='ace_exchange_runtime' AND table_name IN ('user_roles','audit_events') ORDER BY table_name, privilege_type;
-- In a separate SQL Editor connection authenticated as ace_exchange_runtime, run:
-- INSERT INTO audit_events(event_type, action, result_status) VALUES ('runtime_grant_validation','insert','success');
-- UPDATE audit_events SET result_status='tampered' WHERE event_type='runtime_grant_validation'; -- must fail
-- DELETE FROM audit_events WHERE event_type='runtime_grant_validation'; -- must fail
