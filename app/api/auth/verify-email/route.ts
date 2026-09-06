import { providerProxy } from "../../../../lib/proxy";import { enforceRateLimit } from "../../../../lib/rate-limit";
export async function POST(req:Request){const limited=await enforceRateLimit(req,"auth:verify-email");if(limited)return limited;return providerProxy(req,process.env.AUTH_SERVICE_URL,process.env.AUTH_SERVICE_TOKEN,"verify-email",{allowMethods:["POST"],requireSameOrigin:true});}
