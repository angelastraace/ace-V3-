import { readFileSync } from "node:fs";
const files = {
  login: readFileSync("app/api/auth/login/route.ts", "utf8"),
  handler: readFileSync("app/api/auth/[...betterAuth]/route.ts", "utf8"),
  provisioner: readFileSync("scripts/provision-preview-user.mjs", "utf8"),
  proxy: readFileSync("proxy.ts", "utf8"),
};
const required = [
  [files.login, 'authMode === "legacy"'], [files.login, '"/api/auth/sign-in/email"'], [files.login, 'toNextJsHandler(auth).POST'],
  [files.handler, 'pathname.includes("/sign-up")'], [files.provisioner, 'VERCEL_ENV !== "preview"'],
  [files.provisioner, 'VERCEL_GIT_COMMIT_REF'], [files.provisioner, 'role !== "user" && role !== "admin"'],
  [files.provisioner, 'ACE_PREVIEW_USER_PASSWORD'], [files.provisioner, 'user_roles'], [files.provisioner, 'audit_events'],
  [files.proxy, 'pathname.startsWith("/admin")'], [files.proxy, 'return new NextResponse("Forbidden", { status:403 })'],
];
for (const [source, expected] of required) if (!source.includes(expected)) throw new Error(`missing safety invariant: ${expected}`);
if (files.provisioner.includes("console.log(password") || files.provisioner.includes("console.error(password")) throw new Error("password output detected");
console.log("auth-cutover-check: PASS");
