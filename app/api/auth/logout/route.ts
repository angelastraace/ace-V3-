import { providerProxy } from "../../../../lib/proxy";
export async function POST(req:Request){return providerProxy(req,process.env.AUTH_SERVICE_URL,process.env.AUTH_SERVICE_TOKEN,"logout",{allowMethods:["POST"],forwardCookies:true,requireSameOrigin:true});}
