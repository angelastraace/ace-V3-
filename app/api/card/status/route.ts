import { NextResponse } from "next/server";
import { featureFlags } from "../../../../lib/config";
import { providerProxy } from "../../../../lib/proxy";
export async function GET(req:Request){if(!featureFlags.card)return NextResponse.json({status:"blocked",reason:"ACE Card disabled by feature flag"},{status:503});return providerProxy(req,process.env.CARD_PROVIDER_URL,process.env.CARD_PROVIDER_KEY,"status",{allowMethods:["GET"],forwardCookies:true});}
