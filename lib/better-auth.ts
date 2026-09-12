import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
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

    const socialProviders =
      process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
        ? {
            github: {
              clientId: process.env.GITHUB_CLIENT_ID,
              clientSecret: process.env.GITHUB_CLIENT_SECRET,
            },
          }
        : undefined;

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
      socialProviders,
      plugins: [nextCookies()],
    });
  } catch {
    return null;
  }
}
