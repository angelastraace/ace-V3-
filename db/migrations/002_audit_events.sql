CREATE TABLE IF NOT EXISTS audit_events (
  id bigserial PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  actor_user_id text REFERENCES "user"(id) ON DELETE RESTRICT,
  actor_id text,
  actor_type text NOT NULL DEFAULT 'system' CHECK (actor_type IN ('user', 'admin', 'service', 'system')),
  request_id text,
  resource_type text,
  resource_id text,
  action text NOT NULL,
  result_status text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS audit_events_created_idx ON audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_events_resource_idx ON audit_events(resource_type, resource_id, created_at DESC);

CREATE OR REPLACE FUNCTION ace_reject_audit_event_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_events is append-only';
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_events_reject_mutation' AND tgrelid = 'audit_events'::regclass) THEN
    CREATE TRIGGER audit_events_reject_mutation
      BEFORE UPDATE OR DELETE ON audit_events
      FOR EACH ROW EXECUTE FUNCTION ace_reject_audit_event_mutation();
  END IF;
END;
$$;

REVOKE UPDATE, DELETE, TRUNCATE ON audit_events FROM PUBLIC;
