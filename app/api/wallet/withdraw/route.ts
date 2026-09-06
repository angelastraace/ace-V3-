import { providerProxy } from "../../../../lib/proxy";
import { featureFlags, financialCoreReady, publicLaunchApproved } from "../../../../lib/config";
import { enforceRateLimit } from "../../../../lib/rate-limit";
import { NextResponse } from "next/server";
export async function POST(req:Request){
  if(!featureFlags.withdrawals || !financialCoreReady() || !publicLaunchApproved()) return NextResponse.json({status:"blocked",reason:"Withdrawals are not production-enabled"},{status:503});
  const limited=await enforceRateLimit(req,"finance:withdrawal");if(limited)return limited;
  return providerProxy(req,process.env.CUSTODY_API_URL,process.env.CUSTODY_API_KEY,"withdrawals",{allowMethods:["POST"],requireIdempotency:true,requireSameOrigin:true,timeoutMs:12000});
}
