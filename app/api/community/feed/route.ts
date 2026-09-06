import { providerProxy } from "../../../../lib/proxy";
export async function GET(req:Request){return providerProxy(req,process.env.COMMUNITY_API_URL,process.env.COMMUNITY_API_TOKEN,"feed",{allowMethods:["GET"]});}
