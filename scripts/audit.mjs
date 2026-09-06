import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root=process.cwd();
const app=path.join(root,"app");
const required=[
  "/","/markets","/trading","/trade/[symbol]","/convert","/buy","/sell","/wallet","/wallet/deposit","/wallet/withdraw","/transactions","/orders",
  "/card","/card/apply","/card/manage","/governance","/governance/proposals","/governance/proposals/[id]","/governance/delegates","/governance/treasury","/governance/forum",
  "/community","/creator","/creator-hub","/marketplace","/ai","/kat","/security","/verification","/support","/status","/admin/launch-readiness","/login","/register",
  "/terms","/privacy","/risk-disclosure","/aml","/card-terms","/cookie-policy"
];
const pagePath=(route)=> route==="/"?path.join(app,"page.tsx"):path.join(app,...route.split("/").filter(Boolean),"page.tsx");
const missing=required.filter((route)=>!fs.existsSync(pagePath(route)));
if(missing.length){console.error("Missing required routes:",missing);process.exit(1)}

const home=fs.readFileSync(path.join(app,"page.tsx"),"utf8");
if(!home.includes("Trade.<br /><span>Create.</span><br />Connect.")){console.error("Approved homepage headline missing");process.exit(1)}
const hash=crypto.createHash("sha256").update(home).digest("hex");

const files=[];
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(["node_modules",".next"].includes(ent.name))continue;const p=path.join(dir,ent.name);ent.isDirectory()?walk(p):files.push(p)}}
walk(app);
const source=files.filter((f)=>/\.(tsx|ts)$/.test(f)).map((f)=>fs.readFileSync(f,"utf8")).join("\n");
const forbidden=[/#D4AF37/i,/goldenrod/i,/\bgold\b/i];
if(forbidden.some((rx)=>rx.test(source))){console.error("Gold styling/terminology found in application source; review ACE Exchange brand separation.");process.exit(1)}

console.log(`ACE V6 audit passed: ${required.length} critical pages present.`);
console.log(`Homepage SHA-256: ${hash}`);
