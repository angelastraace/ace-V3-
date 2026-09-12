import fs from "node:fs";

const route = fs.readFileSync("app/api/admin/users/password/route.ts", "utf8");
const auth = fs.readFileSync("lib/better-auth.ts", "utf8");
const migration = fs.readFileSync("db/migrations/002_better_auth_admin.sql", "utf8");
const form = fs.readFileSync("app/admin/users/AdminPasswordForm.tsx", "utf8");

const required = [
  [route, "requireAdmin()"],
  [route, "auth.api.setUserPassword"],
  [route, "body: { userId: input.userId.trim(), newPassword: input.newPassword }"],
  [route, "headers: request.headers"],
  [route, "{ status: \"success\" }"],
  [route, "{ status: \"failure\" }"],
  [auth, "admin({ adminRoles: [\"admin\"] })"],
  [migration, 'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role'],
  [migration, 'SET role = roles.role'],
  [form, '/api/admin/users/password'],
];

for (const [source, expected] of required) {
  if (!source.includes(expected)) throw new Error(`missing admin password invariant: ${expected}`);
}

for (const source of [route, form, auth]) {
  if (/console\.(log|error|warn).*password|console\.(log|error|warn).*authorization|console\.(log|error|warn).*token/i.test(source)) {
    throw new Error("sensitive password, authorization, or token logging detected");
  }
}

console.log("admin-password-check: PASS");
