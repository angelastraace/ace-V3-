import { NextResponse } from "next/server";

export function requireInternalStatusAccess(req: Request) {
  const expected = process.env.INTERNAL_STATUS_TOKEN;
  if (!expected) return NextResponse.json({ status:"blocked", reason:"INTERNAL_STATUS_TOKEN not configured" }, { status:503 });
  const supplied = req.headers.get("x-ace-internal-key") || req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!supplied || supplied !== expected) return NextResponse.json({ status:"forbidden" }, { status:403 });
  return null;
}
