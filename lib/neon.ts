import { Pool } from "pg";

const globalForNeon = globalThis as typeof globalThis & { aceNeonPool?: Pool };

export function databaseUrl() {
  return process.env.DATABASE_URL?.trim() || null;
}

export function getNeonPool() {
  const connectionString = databaseUrl();
  if (!connectionString) return null;
  globalForNeon.aceNeonPool ??= new Pool({ connectionString, max: 4 });
  return globalForNeon.aceNeonPool;
}
