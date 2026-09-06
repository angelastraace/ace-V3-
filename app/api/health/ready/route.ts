import { NextResponse } from "next/server";
import { coreAccountReady } from "../../../../lib/config";
export const dynamic = "force-dynamic";
export async function GET(){
  const ready = coreAccountReady();
  return NextResponse.json({status:ready?"ready":"limited",accountBetaReady:ready,time:new Date().toISOString()},{status:200,headers:{"cache-control":"no-store"}});
}
