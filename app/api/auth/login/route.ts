import { providerProxy } from "../../../../lib/proxy";
import { enforceRateLimit } from "../../../../lib/rate-limit";
export async function POST(req:Request){const limited=await enforceRateLimit(req,"auth:login");if(limited)return limited;return providerProxy(req,process.env.AUTH_SERVICE_URL,process.env.AUTH_SERVICE_TOKEN,"login",{allowMethods:["POST"],requireSameOrigin:true});}
