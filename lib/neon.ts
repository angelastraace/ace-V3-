import { Pool } from "pg";

const globalForNeon = globalThis as typeof globalThis & { aceNeonPool?: Pool };

/** Preview Better Auth runtime uses only the Neon integration's pooled URL. */
export function previewNeonDatabaseUrl() {
  return process.env.ACE_NEON_DATABASE_URL?.trim() || null;
}

export function getNeonPool() {
  const connectionString = previewNeonDatabaseUrl();
  if (!connectionString) return null;
  globalForNeon.aceNeonPool ??= new Pool({ connectionString, max: 4 });
  return globalForNeon.aceNeonPool;
}
