import { providerProxy } from "../../../../lib/proxy";
export async function GET(req:Request){return providerProxy(req,process.env.LEDGER_SERVICE_URL,process.env.LEDGER_SERVICE_TOKEN,"transactions",{allowMethods:["GET"],forwardCookies:true});}
