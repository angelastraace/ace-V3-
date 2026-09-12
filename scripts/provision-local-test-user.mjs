import { betterAuth } from "better-auth";
import { PostgresDialect } from "kysely";
import { Pool } from "pg";

const required = [
  "ACE_LOCAL_PROVISIONING_ENABLED",
  "BETTER_AUTH_DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "ACE_PREVIEW_CLIENT_EMAIL",
  "ACE_PREVIEW_CLIENT_PASSWORD",
  "ACE_PREVIEW_ADMIN_EMAIL",
  "ACE_PREVIEW_ADMIN_PASSWORD",
];

function fail(message) {
  console.error(`local-provision: ${message}`);
  process.exit(1);
}

if (process.env.ACE_LOCAL_PROVISIONING_ENABLED !== "true") {
  fail("ACE_LOCAL_PROVISIONING_ENABLED=true is required");
}
if (process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview") {
  fail("Local provisioning is forbidden in Vercel preview/production");
}
if (process.env.NODE_ENV !== "development") {
  fail("Local provisioning requires NODE_ENV=development");
}

for (const key of required) {
  if (!process.env[key] || !String(process.env[key]).trim()) {
    fail(`${key} is required`);
  }
}

const clientEmail = process.env.ACE_PREVIEW_CLIENT_EMAIL.trim();
const clientPassword = process.env.ACE_PREVIEW_CLIENT_PASSWORD.trim();
const adminEmail = process.env.ACE_PREVIEW_ADMIN_EMAIL.trim();
const adminPassword = process.env.ACE_PREVIEW_ADMIN_PASSWORD.trim();
const baseURL = process.env.BETTER_AUTH_URL.trim();

const pool = new Pool({ connectionString: process.env.BETTER_AUTH_DATABASE_URL.trim(), max: 1 });
const auth = betterAuth({
  appName: "ACE Exchange Local Provisioner",
  baseURL,
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET.trim(),
  database: new PostgresDialect({ pool }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    minPasswordLength: 12,
  },
});

async function ensureRole(userId, requestedRole) {
  const existing = await pool.query("SELECT role FROM user_roles WHERE user_id = $1 AND role = $2", [userId, requestedRole]);
  if (!existing.rowCount) {
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2)", [userId, requestedRole]);
  }
}

async function ensureUser(email, password, name, role) {
  const existing = await pool.query('SELECT id FROM "user" WHERE lower(email) = lower($1)', [email]);

  if (existing.rowCount) {
    const userId = existing.rows[0].id;
    const credential = await pool.query(
      'SELECT id FROM account WHERE "userId" = $1 AND "providerId" = $2',
      [userId, "credential"],
    );

    if (!credential.rowCount) {
      fail(`user exists without credential account: ${email}. Refusing to overwrite or delete a local Better Auth identity`);
    }

    await ensureRole(userId, role);
    console.log(JSON.stringify({ status: "existing", email, role, userId }));
    return;
  }

  const result = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
      rememberMe: false,
    },
    headers: new Headers({ origin: baseURL }),
  });

  await ensureRole(result.user.id, role);
  console.log(JSON.stringify({ status: "created", email, role, userId: result.user.id }));
}

try {
  await ensureUser(clientEmail, clientPassword, "ACE Client", "user");
  await ensureUser(adminEmail, adminPassword, "ACE Admin", "admin");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  fail(message);
} finally {
  await pool.end();
}
