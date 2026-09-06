export type ProviderHealth = { provider:string; configured:boolean; status:"connected"|"unavailable"|"blocked"; latencyMs?:number; reason?:string };

type Def={provider:string;base?:string;token?:string};

const defs=():Def[]=>[
  {provider:"auth",base:process.env.AUTH_SERVICE_URL,token:process.env.AUTH_SERVICE_TOKEN},
  {provider:"custody",base:process.env.CUSTODY_API_URL,token:process.env.CUSTODY_API_KEY},
  {provider:"ledger",base:process.env.LEDGER_SERVICE_URL,token:process.env.LEDGER_SERVICE_TOKEN},
  {provider:"marketData",base:process.env.MARKET_DATA_PROVIDER_URL,token:process.env.MARKET_DATA_PROVIDER_TOKEN},
  {provider:"trading",base:process.env.TRADING_EXECUTION_URL,token:process.env.TRADING_EXECUTION_TOKEN},
  {provider:"kyc",base:process.env.KYC_PROVIDER_URL,token:process.env.KYC_PROVIDER_KEY},
  {provider:"aml",base:process.env.AML_PROVIDER_URL,token:process.env.AML_PROVIDER_KEY},
  {provider:"fiat",base:process.env.FIAT_PROVIDER_URL,token:process.env.FIAT_PROVIDER_KEY},
  {provider:"card",base:process.env.CARD_PROVIDER_URL,token:process.env.CARD_PROVIDER_KEY},
  {provider:"audit",base:process.env.AUDIT_SERVICE_URL,token:process.env.AUDIT_SERVICE_TOKEN},
  {provider:"rateLimit",base:process.env.RATE_LIMIT_SERVICE_URL,token:process.env.RATE_LIMIT_SERVICE_TOKEN},
];

async function one(def:Def):Promise<ProviderHealth>{
  if(!def.base||!def.token)return {provider:def.provider,configured:false,status:"blocked",reason:"not configured"};
  let url:URL;try{url=new URL(def.base);}catch{return {provider:def.provider,configured:true,status:"unavailable",reason:"invalid URL"};}
  if(process.env.NODE_ENV==="production"&&url.protocol!=="https:")return {provider:def.provider,configured:true,status:"unavailable",reason:"HTTPS required"};
  const started=Date.now();
  try{
    const response=await fetch(`${def.base.replace(/\/$/,"")}/health`,{headers:{accept:"application/json",authorization:`Bearer ${def.token}`},cache:"no-store",signal:AbortSignal.timeout(3000)});
    return response.ok?{provider:def.provider,configured:true,status:"connected",latencyMs:Date.now()-started}:{provider:def.provider,configured:true,status:"unavailable",latencyMs:Date.now()-started,reason:`health returned ${response.status}`};
  }catch{return {provider:def.provider,configured:true,status:"unavailable",latencyMs:Date.now()-started,reason:"health request failed"};}
}

export async function providerHealth(){return Promise.all(defs().map(one));}
