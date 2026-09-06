import { NextResponse } from "next/server";

const SYMBOLS=["BTC-USD","ETH-USD","SOL-USD"];
const COINS="bitcoin,ethereum,solana";

type Market={symbol:string;name:string;price:number;change:number};

function validMarket(value:any):value is Market{
  return value&&typeof value.symbol==="string"&&typeof value.name==="string"&&Number.isFinite(Number(value.price))&&Number.isFinite(Number(value.change));
}

async function configuredFeed():Promise<Market[]|null>{
  const base=process.env.MARKET_DATA_PROVIDER_URL;const token=process.env.MARKET_DATA_PROVIDER_TOKEN;
  if(!base||!token)return null;
  try{
    const r=await fetch(`${base.replace(/\/$/,"")}/markets?symbols=${encodeURIComponent(SYMBOLS.join(","))}`,{headers:{accept:"application/json",authorization:`Bearer ${token}`},cache:"no-store",signal:AbortSignal.timeout(4000)});
    if(!r.ok)return null;const d=await r.json();const raw=Array.isArray(d)?d:d.markets;if(!Array.isArray(raw))return null;
    const out=raw.filter(validMarket).map((m:Market)=>({...m,price:Number(m.price),change:Number(m.change)}));return out.length?out:null;
  }catch{return null;}
}

async function publicFallback():Promise<Market[]|null>{
  try{
    const response=await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${COINS}&vs_currencies=usd&include_24hr_change=true`,{next:{revalidate:30},headers:{Accept:"application/json"},signal:AbortSignal.timeout(4500)});
    if(!response.ok)return null;const data=await response.json();
    const markets=[
      {symbol:"BTC/USD",name:"Bitcoin",price:Number(data.bitcoin?.usd),change:Number(data.bitcoin?.usd_24h_change)},
      {symbol:"ETH/USD",name:"Ethereum",price:Number(data.ethereum?.usd),change:Number(data.ethereum?.usd_24h_change)},
      {symbol:"SOL/USD",name:"Solana",price:Number(data.solana?.usd),change:Number(data.solana?.usd_24h_change)},
    ].filter(validMarket);
    return markets.length?markets:null;
  }catch{return null;}
}

export async function GET(){
  const production=await configuredFeed();
  if(production)return NextResponse.json({status:"live",tier:"production-provider",markets:production},{headers:{"cache-control":"public, s-maxage=15, stale-while-revalidate=15"}});
  const fallback=await publicFallback();
  if(fallback)return NextResponse.json({status:"live",tier:"public-read-only-fallback",markets:fallback,warning:"Public discovery feed only; not an execution source."},{headers:{"cache-control":"public, s-maxage=15, stale-while-revalidate=15"}});
  return NextResponse.json({status:"unavailable",markets:[]},{status:503,headers:{"cache-control":"no-store"}});
}
