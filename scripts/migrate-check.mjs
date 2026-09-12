import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const migrationDir = path.join(process.cwd(), "db/migrations");
const files = (await readdir(migrationDir)).filter((file) => file.endsWith(".sql")).sort();
if (!files.length) throw new Error("No SQL migrations found.");
for (const file of files) {
  const sql = await readFile(path.join(migrationDir, file), "utf8");
  if (/^\s*(DROP\s+TABLE|TRUNCATE\s+TABLE|DELETE\s+FROM|ALTER\s+TABLE.+DROP\s+COLUMN)\b/im.test(sql)) throw new Error(`Destructive operation rejected in ${file}`);
}
console.log(`Migration validation passed: ${files.length} additive migration files.`);
