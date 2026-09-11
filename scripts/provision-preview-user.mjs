import { betterAuth } from "better-auth";
import { PostgresDialect } from "kysely";
import { Pool } from "pg";

const expectedBranch = "vercel-agent/ace-exchange-preview-auth-test";
const args = process.argv.slice(2);
const valueFor = (flag) => { const index = args.indexOf(flag); return index >= 0 ? args[index + 1] : undefined; };
const email = valueFor("--email")?.trim().toLowerCase();
const role = valueFor("--role");
const password = process.env.ACE_PREVIEW_USER_PASSWORD;

function fail(message) { console.error(`preview-user-create: ${message}`); process.exit(1); }
if (process.env.VERCEL_ENV !== "preview" && process.env.ACE_TRUSTED_PREVIEW_EXECUTION !== "true") fail("Preview execution is required");
if (process.env.VERCEL_GIT_COMMIT_REF && process.env.VERCEL_GIT_COMMIT_REF !== expectedBranch) fail("auth-test branch execution is required");
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("a valid --email is required");
if (!password || password.length < 12) fail("ACE_PREVIEW_USER_PASSWORD must be at least 12 characters");
if (role !== "user" && role !== "admin") fail("--role must be user or admin");
const connectionString = process.env.BETTER_AUTH_DATABASE_URL?.trim();
const secret = process.env.BETTER_AUTH_SECRET?.trim();
if (!connectionString || !secret) fail("BETTER_AUTH_DATABASE_URL and BETTER_AUTH_SECRET are required");
const host = process.env.VERCEL_URL?.trim();
const baseURL = host ? `https://${host}` : process.env.ACE_TRUSTED_PREVIEW_ORIGIN?.trim();
if (!baseURL) fail("VERCEL_URL or ACE_TRUSTED_PREVIEW_ORIGIN is required");

const pool = new Pool({ connectionString, max: 1 });
const auth = betterAuth({
  appName: "ACE Exchange Preview Provisioner",
  baseURL,
  basePath: "/api/auth",
  secret,
  database: new PostgresDialect({ pool }),
  emailAndPassword: { enabled: true, minPasswordLength: 12 },
});

try {
  const existing = await pool.query('SELECT id FROM "user" WHERE email = $1', [email]);
  if (existing.rowCount) fail("identity already exists; refusing role changes");
  const result = await auth.api.signUpEmail({ body: { name: email.split("@")[0], email, password }, headers: new Headers({ origin: baseURL }) });
  const userId = result.user.id;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2)", [userId, role]);
    await client.query("INSERT INTO audit_events (event_type, actor_id, actor_type, resource_type, resource_id, action, result_status, metadata) VALUES ($1, $2, 'system', 'user', $2, 'provision', 'success', $3::jsonb)", ["preview_user_provisioned", userId, JSON.stringify({ role })]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally { client.release(); }
  console.log(JSON.stringify({ status: "created", userId, email, role }));
} catch (error) {
  console.error("preview-user-create: provisioning failed");
  process.exitCode = 1;
} finally {
  await pool.end();
}
