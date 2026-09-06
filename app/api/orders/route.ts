import { providerProxy } from "../../../lib/proxy";
import { featureFlags, financialCoreReady, publicLaunchApproved } from "../../../lib/config";
import { enforceRateLimit } from "../../../lib/rate-limit";
import { NextResponse } from "next/server";
export async function GET(req:Request){if(!featureFlags.trading)return NextResponse.json({status:"blocked",reason:"Trading disabled"},{status:503});return providerProxy(req,process.env.TRADING_EXECUTION_URL,process.env.TRADING_EXECUTION_TOKEN,"orders",{allowMethods:["GET"],forwardCookies:true});}
export async function POST(req:Request){if(!featureFlags.trading || !financialCoreReady() || !publicLaunchApproved()) return NextResponse.json({status:"blocked",reason:"Trading is not production-enabled"},{status:503});const limited=await enforceRateLimit(req,"finance:orders");if(limited)return limited;return providerProxy(req,process.env.TRADING_EXECUTION_URL,process.env.TRADING_EXECUTION_TOKEN,"orders",{allowMethods:["POST"],requireIdempotency:true,requireSameOrigin:true});}
