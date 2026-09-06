import { NextResponse } from "next/server";
import { featureFlags, financialCoreReady, publicLaunchApproved } from "../../../../lib/config";
import { providerProxy } from "../../../../lib/proxy";
import { enforceRateLimit } from "../../../../lib/rate-limit";
export async function POST(req:Request){if(!featureFlags.fiat || !financialCoreReady() || !publicLaunchApproved())return NextResponse.json({status:"blocked",reason:"Fiat services are not production-enabled"},{status:503});const limited=await enforceRateLimit(req,"finance:fiat-quote");if(limited)return limited;return providerProxy(req,process.env.FIAT_PROVIDER_URL,process.env.FIAT_PROVIDER_KEY,"quote",{allowMethods:["POST"],requireSameOrigin:true});}
