import { readFileSync } from "node:fs";
const files = {
  login: readFileSync("app/api/auth/login/route.ts", "utf8"),
  handler: readFileSync("app/api/auth/[...betterAuth]/route.ts", "utf8"),
  register: readFileSync("app/api/auth/register/route.ts", "utf8"),
  provisioner: readFileSync("scripts/provision-preview-user.mjs", "utf8"),
  proxy: readFileSync("proxy.ts", "utf8"),
  origin: readFileSync("lib/auth-origin.ts", "utf8"),
  betterAuth: readFileSync("lib/better-auth.ts", "utf8"),
  serverAuth: readFileSync("lib/server-auth.ts", "utf8"),
};
const required = [
  [files.login, 'authMode === "legacy"'], [files.login, '"/api/auth/sign-in/email"'], [files.login, 'toNextJsHandler(auth).POST'],
  [files.handler, 'pathname.includes("/sign-up")'], [files.register, 'registrationDisabledResponse'],
  [files.provisioner, 'VERCEL_ENV === "production"'], [files.provisioner, 'VERCEL_ENV !== "preview"'],
  [files.provisioner, 'VERCEL_GIT_COMMIT_REF !== expectedBranch'], [files.provisioner, 'role !== "user" && role !== "admin"'],
  [files.provisioner, 'ACE_PREVIEW_USER_PASSWORD'], [files.provisioner, 'user_roles'], [files.provisioner, 'audit_events'], [files.provisioner, 'signUpEmail'],
  [files.proxy, 'pathname.startsWith("/admin")'], [files.proxy, 'return new NextResponse("Forbidden", { status:403 })'],
  [files.origin, 'env.VERCEL_ENV === "preview"'], [files.origin, 'https://${host}'],
  [files.betterAuth, 'betterAuthConfigured()'], [files.betterAuth, 'catch {'], [files.betterAuth, 'return null;'],
  [files.serverAuth, 'selectedMode() === "better-auth" ? betterAuthSession(request) : legacySession(request)'],
];
for (const [source, expected] of required) if (!source.includes(expected)) throw new Error(`missing safety invariant: ${expected}`);
for (const source of Object.values(files)) if (source.includes("console.log(password") || source.includes("console.error(password")) throw new Error("password output detected");
console.log("auth-cutover-check: PASS");
