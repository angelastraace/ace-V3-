import { NextResponse } from "next/server";
import { launchSummary } from "../../../lib/readiness";
export const dynamic="force-dynamic";
export async function GET(){return NextResponse.json({...launchSummary(),time:new Date().toISOString()},{headers:{"cache-control":"no-store"}});}
