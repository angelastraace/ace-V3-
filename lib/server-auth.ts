import { NextResponse, type NextRequest } from "next/server";
import { getBetterAuth } from "./better-auth";
import { getNeonPool } from "./neon";
import { readReviewerSession } from "./reviewer-session";

type LegacySession = { roles?: unknown; user?: { id?: unknown; role?: unknown } | null; authenticated?: unknown; id?: unknown };
export type ServerSession = { authenticated: boolean; userId: string | null; roles: string[]; reason: string };

const unauthenticated = (reason: string): ServerSession => ({ authenticated: false, userId: null, roles: [], reason });

function selectedMode() {
  return process.env.AUTH_MODE === "better-auth" ? "better-auth" : "legacy";
}

async function legacySession(request: NextRequest): Promise<ServerSession> {
  const base = process.env.AUTH_SERVICE_URL;
  const token = process.env.AUTH_SERVICE_TOKEN;
  if (!base || !token) return unauthenticated("auth_not_configured");
  const sessionPath = process.env.AUTH_SESSION_PATH || "session";
  try {
    const response = await fetch(`${base.replace(/\/$/, "")}/${sessionPath.replace(/^\//, "")}`, { headers: { accept: "application/json", authorization: `Bearer ${token}`, cookie: request.headers.get("cookie") || "", "x-request-id": request.headers.get("x-request-id") || crypto.randomUUID() }, cache: "no-store", signal: AbortSignal.timeout(4_000) });
    if (!response.ok) return unauthenticated("invalid_session");
    const data = await response.json().catch(() => ({})) as LegacySession;
    const userId = data.user?.id ?? data.id;
    const roles = Array.isArray(data.roles) ? data.roles.map(String) : data.user?.role != null ? [String(data.user.role)] : [];
    return { authenticated: Boolean(data.authenticated ?? userId), userId: userId ? String(userId) : null, roles, reason: "" };
  } catch { return unauthenticated("auth_unavailable"); }
}

async function betterAuthSession(request: NextRequest): Promise<ServerSession> {
  const auth = getBetterAuth();
  const pool = getNeonPool();
  if (!auth || !pool) return unauthenticated("auth_not_configured");
  try {
    const result = await auth.api.getSession({ headers: request.headers });
    if (!result?.user?.id) return unauthenticated("invalid_session");
    const roleResult = await pool.query<{ role: string }>("SELECT role FROM user_roles WHERE user_id = $1", [result.user.id]);
    return { authenticated: true, userId: result.user.id, roles: roleResult.rows.map((row) => row.role), reason: "" };
  } catch { return unauthenticated("auth_unavailable"); }
}

export async function currentServerSession(request: NextRequest): Promise<ServerSession> {
  const reviewer = readReviewerSession(request.headers.get("cookie"));
  if (reviewer) return { authenticated: true, userId: reviewer.userId, roles: reviewer.roles, reason: "" };
  return selectedMode() === "better-auth" ? betterAuthSession(request) : legacySession(request);
}

export function registrationDisabled() {
  return process.env.ENABLE_REGISTRATION !== "true";
}

export function registrationDisabledResponse() {
  return NextResponse.json({ status: "blocked", reason: "Registration is not enabled" }, { status: 503, headers: { "cache-control": "no-store" } });
}

export type ServerPrincipal = { userId:string; email:string; roles:string[]; sessionId:string; authenticated:true };
/** Financial APIs accept only the Better Auth server session and DB-authoritative roles. */
export async function getServerPrincipal():Promise<ServerPrincipal|null>{
  if(process.env.AUTH_MODE!=="better-auth")return null;
  const auth=getBetterAuth(),pool=getNeonPool();if(!auth||!pool)return null;
  try{const {headers}=await import("next/headers");const result=await auth.api.getSession({headers:await headers()});if(!result?.user?.id||!result.user.email||!result.session?.id)return null;const roles=await pool.query<{role:string}>("SELECT role FROM user_roles WHERE user_id=$1",[result.user.id]);return{userId:result.user.id,email:result.user.email,roles:roles.rows.map(r=>r.role),sessionId:result.session.id,authenticated:true}}catch{return null}
}
export async function requireAuthenticatedUser(){const p=await getServerPrincipal();if(!p)throw Error("AUTHENTICATION_REQUIRED");return p}
export async function requireRole(role:string){const p=await requireAuthenticatedUser();if(!p.roles.includes(role))throw Error("FORBIDDEN");return p}
export async function requireAdmin(){return requireRole("admin")}
export function assertOwnsResource(principal:ServerPrincipal,resourceUserId:string){if(principal.userId!==resourceUserId)throw Error("FORBIDDEN");return true}
