import { createHmac, timingSafeEqual } from "node:crypto";

const cookieName = "ace_preview_reviewer";
const expectedBranch = "vercel-agent/ace-exchange-preview-auth-test";
type ReviewerRole = "user" | "admin";
type ReviewerSession = { userId: string; roles: ReviewerRole[] };

function reviewerEnabled() {
  return process.env.VERCEL_ENV === "preview"
    && process.env.VERCEL_GIT_COMMIT_REF === expectedBranch;
}

function signature(payload: string) {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (!secret) return null;
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function previewReviewerEnabled() {
  return reviewerEnabled();
}

export function createReviewerSession(role: ReviewerRole) {
  if (!reviewerEnabled()) return null;
  const payload = Buffer.from(JSON.stringify({ role, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  const mac = signature(payload);
  return mac ? `${payload}.${mac}` : null;
}

export function readReviewerSession(cookieHeader: string | null): ReviewerSession | null {
  if (!reviewerEnabled()) return null;
  const value = cookieHeader?.split(";").map((entry) => entry.trim()).find((entry) => entry.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  if (!value) return null;
  const [payload, received] = value.split(".");
  const expected = payload ? signature(payload) : null;
  if (!payload || !received || !expected) return null;
  const receivedBuf = Buffer.from(received);
  const expectedBuf = Buffer.from(expected);
  if (receivedBuf.length !== expectedBuf.length || !timingSafeEqual(receivedBuf, expectedBuf)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { role?: unknown; exp?: unknown };
    if ((data.role !== "user" && data.role !== "admin") || typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return { userId: `preview-reviewer:${data.role}`, roles: [data.role] };
  } catch { return null; }
}

export const previewReviewerCookie = cookieName;
