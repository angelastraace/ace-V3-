/** Simulation-only reward settlement domain. No wallet, key, approval, or execution integration exists here. */
export type Asset = "USDC"|"USDT"|"WETH";
export type RewardState = "EARNED"|"VESTED"|"RESERVED"|"CLAIM_PENDING"|"CLAIMED"|"CANCELLED";
export type FundingType = "PROTOCOL_REVENUE"|"SPONSOR"|"PARTNER"|"TREASURY"|"CREDIT";
export type ProviderName = "Uniswap V3"|"Curve"|"Balancer"|"Aggregator";
export type LiquidityPoolConnection = { provider:ProviderName; status:"simulation"|"configured"|"offline"; route:string; description:string; endpoint?:string; };
export type ACEArchitecture = {
  rewardFundingEngine:{name:string;role:string;status:"simulation"|"disabled";summary:string;sources:string[];};
  rewardLiability:{name:string;role:string;status:string;summary:string;amountLabel:string;};
  liquidityRoutingEngine:{name:string;role:string;status:"simulation"|"disabled";summary:string;providers:ProviderName[];};
  executionModel:"just-in-time settlement";
  connectedPools:LiquidityPoolConnection[];
  failClosedRule:string;
};
export const executionEnabled = false as const;
export const simulationMode = () => process.env.ACE_LIQUIDITY_EXECUTION_MODE === "simulation" ? "simulation" : "disabled";
export const assets: Asset[] = ["USDC","USDT","WETH"];

export function aceGlobalLiquidityArchitecture():ACEArchitecture {
  const poolStatus = (provider:ProviderName, endpoint?:string): LiquidityPoolConnection["status"] => {
    if (!endpoint) return "simulation";
    return endpoint.trim().length > 0 ? "configured" : "simulation";
  };

  const connectedPools: LiquidityPoolConnection[] = [
    { provider: "Uniswap V3", status: poolStatus("Uniswap V3", process.env.ACE_LIQUIDITY_POOL_UNISWAP_URL), route: "USDC → USDT / WETH → USDT", description: "Primary external DEX execution liquidity.", endpoint: process.env.ACE_LIQUIDITY_POOL_UNISWAP_URL },
    { provider: "Curve", status: poolStatus("Curve", process.env.ACE_LIQUIDITY_POOL_CURVE_URL), route: "USDC / USDT stable conversion", description: "Low-slippage stablecoin routing source.", endpoint: process.env.ACE_LIQUIDITY_POOL_CURVE_URL },
    { provider: "Balancer", status: poolStatus("Balancer", process.env.ACE_LIQUIDITY_POOL_BALANCER_URL), route: "WETH / USDC / USDT route balancing", description: "Secondary multi-asset execution path.", endpoint: process.env.ACE_LIQUIDITY_POOL_BALANCER_URL },
    { provider: "Aggregator", status: poolStatus("Aggregator", process.env.ACE_LIQUIDITY_POOL_AGGREGATOR_URL), route: "Best route across providers", description: "Fallback route selection and optimizer.", endpoint: process.env.ACE_LIQUIDITY_POOL_AGGREGATOR_URL }
  ];

  return {
    rewardFundingEngine: {
      name: "Reward Funding Engine",
      role: "determines ACE economic backing",
      status: simulationMode() === "simulation" ? "simulation" : "disabled",
      summary: "Determines what ACE actually owes.",
      sources: ["protocol revenue", "sponsor funding", "partner revenue", "treasury", "approved credit"]
    },
    rewardLiability: {
      name: "Reward Liability",
      role: "captures the internal value ACE owes to users",
      status: "accrued",
      summary: "Reward-denominated liability that is settled against approved backing.",
      amountLabel: "USD-denominated liability"
    },
    liquidityRoutingEngine: {
      name: "Liquidity Routing Engine",
      role: "sources external DEX liquidity",
      status: simulationMode() === "simulation" ? "simulation" : "disabled",
      summary: "Finds the cheapest external route for the actual reward asset conversion.",
      providers: ["Uniswap V3", "Curve", "Balancer", "Aggregator"]
    },
    executionModel: "just-in-time settlement",
    connectedPools,
    failClosedRule: "If no configured route clears slippage, depth, and oracle checks, the claim is rejected and no reward is paid."
  };
}
const usd: Record<Asset,number> = {USDC:1,USDT:1,WETH:2500};
export type FundingAsset = { asset:Asset; amount:number; usdValue:number };
export type Route = { provider:ProviderName; tokenIn:Asset; tokenOut:Asset; amountIn:number; amountOut:number; price:number; fee:number; estimatedGas:number; slippageBps:number; liquidityDepth:number; priceImpactBps:number; routeScore:number; quoteAt:string; executionEnabled:false };
export type Adapter = { name:ProviderName; executionEnabled:false; getProviderStatus:()=>{status:"healthy"|"unavailable"; supportedAssets:Asset[]}; getSupportedAssets:()=>Asset[]; getQuote:(input:{tokenIn:Asset;tokenOut:Asset;amountIn:number})=>Route|null; estimateGas:()=>number; estimateSlippage:(amountUsd:number)=>number; getAvailableLiquidity:(asset:Asset)=>number; simulateSwap:(input:{tokenIn:Asset;tokenOut:Asset;amountIn:number})=>Route|null; healthCheck:()=>boolean };
const profiles: Record<ProviderName,{fee:number;gas:number;slippage:number;depth:number;health:boolean}> = {
  "Uniswap V3":{fee:30,gas:12,slippage:14,depth:150000,health:true}, Curve:{fee:4,gas:9,slippage:5,depth:300000,health:true}, Balancer:{fee:12,gas:11,slippage:10,depth:110000,health:true}, Aggregator:{fee:18,gas:15,slippage:7,depth:220000,health:true}
};
function adapter(name:ProviderName):Adapter { const p=profiles[name]; const quote=(i:{tokenIn:Asset;tokenOut:Asset;amountIn:number}):Route|null=>{if(!p.health||i.tokenIn===i.tokenOut||!Number.isFinite(i.amountIn)||i.amountIn<=0)return null; const inputUsd=i.amountIn*usd[i.tokenIn]; if(inputUsd>p.depth)return null; const out=inputUsd/usd[i.tokenOut]*(1-(p.fee+p.slippage)/10000); const score=out*usd[i.tokenOut]-p.gas-inputUsd*(p.slippage/10000); return {provider:name,tokenIn:i.tokenIn,tokenOut:i.tokenOut,amountIn:i.amountIn,amountOut:out,price:usd[i.tokenIn]/usd[i.tokenOut],fee:p.fee,estimatedGas:p.gas,slippageBps:p.slippage,liquidityDepth:p.depth,priceImpactBps:Math.ceil(inputUsd/p.depth*10000),routeScore:score,quoteAt:new Date().toISOString(),executionEnabled:false};}; return {name,executionEnabled:false,getProviderStatus:()=>({status:p.health?"healthy":"unavailable",supportedAssets:assets}),getSupportedAssets:()=>assets,getQuote:quote,estimateGas:()=>p.gas,estimateSlippage:(v)=>p.slippage+Math.ceil(v/p.depth*10),getAvailableLiquidity:()=>p.depth,simulateSwap:quote,healthCheck:()=>p.health}; }
export const providers=[adapter("Uniswap V3"),adapter("Curve"),adapter("Balancer"),adapter("Aggregator")];
export const riskLimits={MAX_SLIPPAGE_BPS:100,MAX_PRICE_IMPACT_BPS:100,MAX_ROUTE_COUNT:3,MIN_PROVIDER_LIQUIDITY:1000,MAX_REWARD_CLAIM_USD:1000,MAX_QUOTE_AGE_MS:60_000,MAX_ORACLE_DEVIATION_BPS:100};
export class RiskEngine { validate(routes:Route[], targetUsd:number){if(simulationMode()!=="simulation")throw new Error("LIQUIDITY_SIMULATION_DISABLED");if(targetUsd<=0||targetUsd>riskLimits.MAX_REWARD_CLAIM_USD)throw new Error("REWARD_CLAIM_LIMIT");if(!routes.length)throw new Error("INSUFFICIENT_LIQUIDITY");if(routes.length>riskLimits.MAX_ROUTE_COUNT)throw new Error("ROUTE_COUNT_LIMIT");for(const r of routes){if(Date.now()-Date.parse(r.quoteAt)>riskLimits.MAX_QUOTE_AGE_MS)throw new Error("STALE_QUOTE");if(r.liquidityDepth<riskLimits.MIN_PROVIDER_LIQUIDITY)throw new Error("INSUFFICIENT_PROVIDER_LIQUIDITY");if(r.slippageBps>riskLimits.MAX_SLIPPAGE_BPS)throw new Error("EXCESSIVE_SLIPPAGE");if(r.priceImpactBps>riskLimits.MAX_PRICE_IMPACT_BPS)throw new Error("EXCESSIVE_PRICE_IMPACT");}return true;}}
export class FundingService { backing=10_000; outstanding=250; available():number{return this.backing-this.outstanding} assertBacking(amount:number){if(this.backing<this.outstanding+amount)throw new Error("INSUFFICIENT_APPROVED_BACKING");return true} sources(){return [{type:"PROTOCOL_REVENUE" as FundingType,approvedUsd:this.backing,allocatedUsd:this.outstanding,availableUsd:this.available(),status:"approved"}]} }
export class LedgerService { entries:Array<{id:string;type:string;debit:string;credit:string;amount:number;at:string}>=[]; append(type:string,debit:string,credit:string,amount:number){if(amount<=0)throw new Error("LEDGER_IMBALANCE");const entry={id:crypto.randomUUID(),type,debit,credit,amount,at:new Date().toISOString()};this.entries.push(entry);return entry} }
export class RewardAccountingService { balance={earned:250,vested:250,reserved:0,claimed:0,state:"VESTED" as RewardState}; reserve(amount:number){if(amount<=0||amount>this.balance.vested-this.balance.reserved-this.balance.claimed)throw new Error("INSUFFICIENT_VESTED_REWARD");this.balance.reserved+=amount;this.balance.state="RESERVED";return this.balance} }
export class LiquidityRouter { constructor(private adapters=providers){} quote(targetAsset:Asset,targetRewardValue:number,availableFundingAssets:FundingAsset[]){const routes=this.adapters.flatMap(a=>availableFundingAssets.map(f=>a.simulateSwap({tokenIn:f.asset,tokenOut:targetAsset,amountIn:Math.min(f.amount,targetRewardValue/usd[f.asset])})).filter((r):r is Route=>Boolean(r))).sort((a,b)=>b.routeScore-a.routeScore); let remaining=targetRewardValue; const selected:Route[]=[]; for(const route of routes){if(remaining<=0||selected.length>=riskLimits.MAX_ROUTE_COUNT)break; const maxOut=route.amountOut*usd[targetAsset];const used=Math.min(remaining,maxOut);const ratio=used/maxOut;selected.push({...route,amountIn:route.amountIn*ratio,amountOut:route.amountOut*ratio,routeScore:route.routeScore*ratio});remaining-=used}return {candidateRoutes:routes,selectedRoutes:selected,unfilledUsd:Math.max(0,remaining),estimatedReceived:selected.reduce((n,r)=>n+r.amountOut,0),executionEnabled:false as const};} }
const funding=new FundingService(), rewards=new RewardAccountingService(), ledger=new LedgerService(); const idempotency=new Map<string,unknown>();
export function simulator(){return {funding,rewards,ledger,router:new LiquidityRouter(),risk:new RiskEngine()}}
export class SettlementService { simulate(input:{idempotencyKey:string;targetAsset:Asset;amountUsd:number}){if(!input.idempotencyKey||input.idempotencyKey.length>200)throw new Error("IDEMPOTENCY_KEY_REQUIRED");const prior=idempotency.get(input.idempotencyKey);if(prior)return prior;const s=simulator();s.funding.assertBacking(input.amountUsd);const plan=s.router.quote(input.targetAsset,input.amountUsd,[{asset:"USDC",amount:5000,usdValue:5000},{asset:"WETH",amount:1.2,usdValue:3000},{asset:"USDT",amount:2000,usdValue:2000}]);if(plan.unfilledUsd>0)throw new Error("INSUFFICIENT_LIQUIDITY");s.risk.validate(plan.selectedRoutes,input.amountUsd);s.rewards.reserve(input.amountUsd);const reservation=s.ledger.append("reward_reservation","reward_liability","reward_reserved",input.amountUsd);const settlement=s.ledger.append("settlement_simulation","funding_available","simulated_payout",input.amountUsd);const result={status:"simulated",executionEnabled:false,claimId:crypto.randomUUID(),targetAsset:input.targetAsset,amountUsd:input.amountUsd,plan,ledgerEntries:[reservation,settlement],auditEvent:{action:"reward_claim_simulated",at:new Date().toISOString()}};idempotency.set(input.idempotencyKey,result);return result} }
export function simulateClaim(input:{idempotencyKey:string;targetAsset:Asset;amountUsd:number}){return new SettlementService().simulate(input)}
