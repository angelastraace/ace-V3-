import { providerProxy } from "../../../../lib/proxy";
export async function GET(req:Request){return providerProxy(req,process.env.CREATOR_API_URL,process.env.CREATOR_API_TOKEN,"profile",{allowMethods:["GET"],forwardCookies:true});}
