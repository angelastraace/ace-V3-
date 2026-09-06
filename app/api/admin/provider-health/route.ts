import { NextResponse } from "next/server";import { requireInternalStatusAccess } from "../../../../lib/internal-access";import { providerHealth } from "../../../../lib/provider-health";
export const dynamic="force-dynamic";
export async function GET(req:Request){const denied=requireInternalStatusAccess(req);if(denied)return denied;const providers=await providerHealth();return NextResponse.json({time:new Date().toISOString(),providers},{headers:{"cache-control":"no-store"}});}
