import { getNeonPool } from "./neon";

export type AuditMetadata = {
  source?: string;
  route?: string;
  method?: string;
  errorCode?: string;
  provider?: string;
  version?: string;
};

export type AuditEvent = {
  eventType: string;
  actorUserId?: string | null;
  actorType?: "user" | "admin" | "service" | "system";
  requestId?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  action: string;
  resultStatus: string;
  metadata?: AuditMetadata;
};

/** INSERT-only audit writer. Do not add update or delete operations here. */
export async function appendAuditEvent(event: AuditEvent) {
  const pool = getNeonPool();
  if (!pool) throw new Error("Audit storage is not configured");
  await pool.query(
    `INSERT INTO audit_events (event_type, actor_user_id, actor_id, actor_type, request_id, resource_type, resource_id, action, result_status, metadata)
     VALUES ($1, $2, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)`,
    [event.eventType, event.actorUserId ?? null, event.actorType ?? "system", event.requestId ?? null, event.resourceType ?? null, event.resourceId ?? null, event.action, event.resultStatus, JSON.stringify(event.metadata ?? {})],
  );
}
