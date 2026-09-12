import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { PostgresDialect } from "kysely";
import { Pool } from "pg";

function fail(message) {
  console.error(`local-user-provisioning: ${message}`);
  process.exitCode = 1;
}

if (process.env.VERCEL_ENV === "production") fail("Production execution is forbidden");
if (process.env.VERCEL_ENV === "preview") fail("Preview execution is forbidden");
if (process.exitCode) process.exit();
if (process.env.ACE_LOCAL_PROVISIONING_ENABLED !== "true") fail("ACE_LOCAL_PROVISIONING_ENABLED=true is required");
if (process.exitCode) process.exit();

const databaseUrl = process.env.BETTER_AUTH_DATABASE_URL?.trim();
const secret = process.env.BETTER_AUTH_SECRET?.trim();
const baseURL = process.env.BETTER_AUTH_URL?.trim();
const clientEmail = process.env.ACE_PREVIEW_CLIENT_EMAIL?.trim().toLowerCase();
const clientPassword = process.env.ACE_PREVIEW_CLIENT_PASSWORD;
const adminEmail = process.env.ACE_PREVIEW_ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ACE_PREVIEW_ADMIN_PASSWORD;

if (!databaseUrl || !secret || !baseURL) fail("Better Auth database, secret, and URL configuration are required");
if (!clientEmail || !adminEmail || clientEmail === adminEmail) fail("distinct client and admin emails are required");
if (!clientPassword || clientPassword.length < 12 || !adminPassword || adminPassword.length < 12) fail("both configured passwords must be at least 12 characters");
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) fail("valid client and admin emails are required");
if (process.exitCode) process.exit();

let parsedBaseURL;
try {
  parsedBaseURL = new URL(baseURL);
} catch {
  fail("BETTER_AUTH_URL must be a valid URL");
}
if (process.exitCode) process.exit();

const pool = new Pool({ connectionString: databaseUrl, max: 1 });
const auth = betterAuth({
  appName: "ACE Exchange Local Provisioner",
  baseURL: parsedBaseURL.toString(),
  basePath: "/api/auth",
  secret,
  database: new PostgresDialect({ pool }),
  emailAndPassword: { enabled: true, disableSignUp: false, minPasswordLength: 12 },
  plugins: [admin({ adminRoles: ["admin"] })],
});

const users = [
  { email: clientEmail, password: clientPassword, role: "user" },
  { email: adminEmail, password: adminPassword, role: "admin" },
];

try {
  const existing = await pool.query('SELECT email FROM "user" WHERE email = ANY($1::text[])', [[clientEmail, adminEmail]]);
  if (existing.rowCount) fail("one or more configured identities already exist; refusing to update or delete users");
  if (process.exitCode) process.exit();

  const headers = new Headers({ origin: parsedBaseURL.origin });
  const created = [];
  for (const user of users) {
    const result = await auth.api.signUpEmail({
      body: { name: user.email.split("@")[0], email: user.email, password: user.password, rememberMe: false },
      headers,
    });
    if (!result?.user?.id) throw new Error("Better Auth did not return a created user");
    created.push({ id: result.user.id, email: user.email, role: user.role });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const user of created) {
      await client.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2)", [user.id, user.role]);
      await client.query('UPDATE "user" SET role = $2, "updatedAt" = now() WHERE id = $1', [user.id, user.role]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }

  for (const user of created) console.log(JSON.stringify({ status: "created", userId: user.id, email: user.email, role: user.role }));
} catch {
  console.error("local-user-provisioning: failed; no existing users were deleted or updated");
  process.exitCode = 1;
} finally {
  await pool.end();
}
