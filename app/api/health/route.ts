import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET(){
  return NextResponse.json({status:"ok",service:"ace-exchange-web",time:new Date().toISOString(),version:"6.0.0"},{headers:{"cache-control":"no-store"}});
}
