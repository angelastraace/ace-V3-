import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const files=[];
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(["node_modules",".next",".git"].includes(ent.name))continue;const p=path.join(dir,ent.name);ent.isDirectory()?walk(p):files.push(p)}}
walk(root);
const textFiles=files.filter((f)=>/\.(ts|tsx|js|mjs|json|md|example|txt|css|sql)$/.test(f)||path.basename(f)===".env.example");
const findings=[];
const highRisk=[
  [/(?:seed phrase|mnemonic)\s*[:=]\s*["'][^"']{12,}/i,"possible seed phrase"],
  [/(?:private[_-]?key|secret[_-]?key)\s*[:=]\s*["'][A-Za-z0-9_\-\/+ =]{24,}/i,"possible hard-coded private/secret key"],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,"private key block"],
];
for(const file of textFiles){const content=fs.readFileSync(file,"utf8");for(const [rx,label] of highRisk){if(rx.test(content))findings.push(`${label}: ${path.relative(root,file)}`)}}
if(findings.length){console.error("Security audit failed:\n"+findings.join("\n"));process.exit(1)}
const nextConfig=fs.readFileSync(path.join(root,"next.config.ts"),"utf8");
for(const header of ["Content-Security-Policy","Strict-Transport-Security","X-Content-Type-Options","Referrer-Policy","Permissions-Policy"]){if(!nextConfig.includes(header)){console.error(`Security header missing: ${header}`);process.exit(1)}}
const proxy=fs.readFileSync(path.join(root,"proxy.ts"),"utf8");
for(const route of ["/api/orders","/api/wallet","/api/fiat","/api/card","/api/kyc","/api/governance/vote","/api/community/post","/api/creator/payout"]){if(!proxy.includes(route)){console.error(`Protected API matcher missing: ${route}`);process.exit(1)}}
const providerProxy=fs.readFileSync(path.join(root,"lib/proxy.ts"),"utf8");
for(const marker of ["requireIdempotency","Origin check failed","payload_too_large"]){if(!providerProxy.includes(marker)){console.error(`Provider proxy hardening missing: ${marker}`);process.exit(1)}}
const readiness=fs.readFileSync(path.join(root,"lib/readiness.ts"),"utf8");
const config=fs.readFileSync(path.join(root,"lib/config.ts"),"utf8");
for(const gate of ["legalLaunchApproved","operationsLaunchApproved","securityLaunchApproved"]){if(!readiness.includes(gate)){console.error(`Public launch approval gate missing: ${gate}`);process.exit(1)}}
if(!config.includes("financialProviderValidationApproved")){console.error("Financial provider validation approval gate missing");process.exit(1)}
const env=fs.readFileSync(path.join(root,".env.example"),"utf8");
for(const gate of ["LEGAL_LAUNCH_APPROVED=false","OPERATIONS_LAUNCH_APPROVED=false","SECURITY_LAUNCH_APPROVED=false","FINANCIAL_PROVIDER_VALIDATION_APPROVED=false","ENABLE_TRADING=false","ENABLE_WITHDRAWALS=false","ENABLE_CARD=false"]){if(!env.includes(gate)){console.error(`Fail-closed environment default missing: ${gate}`);process.exit(1)}}
console.log(`Security audit passed across ${textFiles.length} source/config/ops files.`);
