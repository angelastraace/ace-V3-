import assert from "node:assert/strict";
import { migrationConnection } from "./migration-connection.mjs";

assert.throws(() => migrationConnection({ DATABASE_URL: "postgres://legacy" }), /DATABASE_URL_DIRECT is required/);
assert.equal(migrationConnection({ DATABASE_URL_DIRECT: "postgres://migrator" }).source, "DATABASE_URL_DIRECT");
assert.equal(migrationConnection({ DATABASE_URL_DIRECT: "postgres://migrator", DATABASE_URL: "postgres://legacy" }).value, "postgres://migrator");
console.log("Migration connection selection tests passed.");
