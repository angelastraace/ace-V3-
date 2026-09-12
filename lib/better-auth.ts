import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { PostgresDialect } from "kysely";
import { betterAuthDatabaseUrl, getNeonPool } from "./neon";
import { resolveBetterAuthOrigin } from "./auth-origin";

export function betterAuthConfigured() {
  return Boolean(betterAuthDatabaseUrl() && process.env.BETTER_AUTH_SECRET?.trim() && resolveBetterAuthOrigin());
}

/** Returns null for any incomplete or invalid configuration; callers must deny access. */
export function getBetterAuth() {
  try {
    const pool = getNeonPool();
    if (!pool || !betterAuthConfigured()) return null;

    const baseURL = resolveBetterAuthOrigin();
    if (!baseURL) return null;
    return betterAuth({
      appName: "ACE Exchange",
      baseURL,
      basePath: "/api/auth",
      secret: process.env.BETTER_AUTH_SECRET!,
      database: new PostgresDialect({ pool }),
      emailAndPassword: {
        enabled: true,
        disableSignUp: true,
        minPasswordLength: 12,
      },
      plugins: [nextCookies(), admin({ adminRoles: ["admin"] })],
    });
  } catch {
    return null;
  }
}
