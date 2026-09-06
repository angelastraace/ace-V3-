import { providerProxy } from "../../../../lib/proxy";
export async function GET(req:Request){return providerProxy(req,process.env.GOVERNANCE_API_URL,process.env.GOVERNANCE_API_TOKEN,"proposals",{allowMethods:["GET"]});}
