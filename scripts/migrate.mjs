import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import { migrationConnection } from "./migration-connection.mjs";

const { source, value: connectionString } = migrationConnection();
console.log(`Migration mode enabled; connection source = ${source}`);
const migrationDir = path.join(process.cwd(), "db/migrations");
const pool = new Pool({ connectionString, max: 1 });

try {
  await pool.query("CREATE TABLE IF NOT EXISTS schema_migrations (id text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())");
  for (const id of (await readdir(migrationDir)).filter((file) => file.endsWith(".sql")).sort()) {
    const sql = await readFile(path.join(migrationDir, id), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const applied = await pool.query("SELECT checksum FROM schema_migrations WHERE id = $1", [id]);
    if (applied.rowCount) {
      if (applied.rows[0].checksum !== checksum) throw new Error(`Applied migration checksum differs: ${id}`);
      continue;
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (id, checksum) VALUES ($1, $2)", [id, checksum]);
      await client.query("COMMIT");
      console.log(`Applied ${id}`);
    } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
  }
} finally { await pool.end(); }
