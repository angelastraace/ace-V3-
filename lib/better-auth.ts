import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { PostgresDialect } from "kysely";
import { previewNeonDatabaseUrl, getNeonPool } from "./neon";

export function betterAuthConfigured() {
  return Boolean(previewNeonDatabaseUrl() && process.env.BETTER_AUTH_SECRET?.trim() && process.env.BETTER_AUTH_URL?.trim());
}

export function getBetterAuth() {
  const pool = getNeonPool();
  if (!pool || !betterAuthConfigured()) return null;

  return betterAuth({
    appName: "ACE Exchange",
    baseURL: process.env.BETTER_AUTH_URL!,
    basePath: "/api/auth",
    secret: process.env.BETTER_AUTH_SECRET!,
    database: new PostgresDialect({ pool }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 12,
    },
    plugins: [nextCookies()],
  });
}
