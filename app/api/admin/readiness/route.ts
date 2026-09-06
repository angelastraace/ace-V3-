import { NextResponse } from "next/server";
import { readinessItems, launchSummary } from "../../../../lib/readiness";
import { requireInternalStatusAccess } from "../../../../lib/internal-access";
export const dynamic="force-dynamic";
export async function GET(req:Request){const denied=requireInternalStatusAccess(req);if(denied)return denied;return NextResponse.json({...launchSummary(),items:readinessItems(),time:new Date().toISOString()},{headers:{"cache-control":"no-store"}});}
