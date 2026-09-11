export function resolveBetterAuthOrigin(env = process.env): string | null {
  if (env.VERCEL_ENV === "preview") {
    const host = env.VERCEL_URL?.trim();
    return host ? `https://${host}` : null;
  }
  if (env.VERCEL_ENV === "production") return env.BETTER_AUTH_URL?.trim() || null;
  return env.BETTER_AUTH_URL?.trim() || null;
}
