import { NextResponse } from "next/server";
import { featureFlags } from "../../../../lib/config";
import { providerProxy } from "../../../../lib/proxy";
import { enforceRateLimit } from "../../../../lib/rate-limit";

export async function POST(req:Request){
  if(!featureFlags.registration) return NextResponse.json({status:"blocked",reason:"Registration is not enabled"},{status:503});
  const limited=await enforceRateLimit(req,"auth:register"); if(limited)return limited;
  return providerProxy(req,process.env.AUTH_SERVICE_URL,process.env.AUTH_SERVICE_TOKEN,"register",{allowMethods:["POST"],requireSameOrigin:true});
}
