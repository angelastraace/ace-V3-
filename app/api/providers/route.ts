import { NextResponse } from "next/server";
import { providerConfig, featureFlags } from "../../../lib/config";
import { requireInternalStatusAccess } from "../../../lib/internal-access";
export const dynamic="force-dynamic";
export async function GET(req:Request){const denied=requireInternalStatusAccess(req);if(denied)return denied;return NextResponse.json({providers:providerConfig,features:featureFlags,time:new Date().toISOString()},{headers:{"cache-control":"no-store"}});}
