import { Pool } from "pg";

const globalForNeon = globalThis as typeof globalThis & { aceNeonPool?: Pool };

/** Better Auth runtime uses only its explicitly assigned pooled Preview URL. */
export function betterAuthDatabaseUrl() {
  return process.env.BETTER_AUTH_DATABASE_URL?.trim() || null;
}

export function getNeonPool() {
  const connectionString = betterAuthDatabaseUrl();
  if (!connectionString) return null;
  globalForNeon.aceNeonPool ??= new Pool({ connectionString, max: 4 });
  return globalForNeon.aceNeonPool;
}
