import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET(){return NextResponse.json({status:"live",service:"ace-exchange-web",time:new Date().toISOString()},{headers:{"cache-control":"no-store"}});}
