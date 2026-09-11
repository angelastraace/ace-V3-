import fs from "node:fs";
const sample=fs.readFileSync(".env.example","utf8");
const keys=[...sample.matchAll(/^([A-Z0-9_]+)=/gm)].map((m)=>m[1]);
const requiredForBeta=["DATABASE_URL","AUTH_SERVICE_URL","AUTH_SERVICE_TOKEN","EMAIL_API_URL","EMAIL_API_KEY","MONITORING_DSN","AUDIT_SERVICE_URL","AUDIT_SERVICE_TOKEN","RATE_LIMIT_SERVICE_URL","RATE_LIMIT_SERVICE_TOKEN","INTERNAL_STATUS_TOKEN"];
const betaStackKeys=["DATABASE_URL","NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY","CLERK_SECRET_KEY","RESEND_API_KEY","EMAIL_FROM","NEXT_PUBLIC_SENTRY_DSN","UPSTASH_REDIS_REST_URL","UPSTASH_REDIS_REST_TOKEN"];
const approvalKeys=["CONTROLLED_BETA_APPROVED","LEGAL_LAUNCH_APPROVED","OPERATIONS_LAUNCH_APPROVED","SECURITY_LAUNCH_APPROVED","FINANCIAL_PROVIDER_VALIDATION_APPROVED"];
const missingTemplate=[...requiredForBeta,...betaStackKeys,...approvalKeys,"ENABLE_REGISTRATION"].filter((key)=>!keys.includes(key));
if(missingTemplate.length){console.error(".env.example is missing required keys:",missingTemplate);process.exit(1)}
const configured=requiredForBeta.filter((key)=>Boolean(process.env[key]));
console.log(`Environment template passed. Runtime configured beta keys: ${configured.length}/${requiredForBeta.length}.`);
console.log(`Selected beta-stack keys present in template: ${betaStackKeys.length}/${betaStackKeys.length}.`);
console.log(`Release approvals default fail-closed: ${approvalKeys.every((key)=>!sample.match(new RegExp(`^${key}=true$`,`m`)))?"yes":"NO"}.`);
if(process.env.CI&&configured.length<requiredForBeta.length)console.log("CI note: production secrets are expected to be supplied by the deployment environment, not committed to source.");
