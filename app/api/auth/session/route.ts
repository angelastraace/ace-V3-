import { providerProxy } from "../../../../lib/proxy";
export async function GET(req:Request){return providerProxy(req,process.env.AUTH_SERVICE_URL,process.env.AUTH_SERVICE_TOKEN,process.env.AUTH_SESSION_PATH||"session",{allowMethods:["GET"],forwardCookies:true});}
