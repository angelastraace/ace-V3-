import fs from "node:fs";
import path from "node:path";
const app=path.join(process.cwd(),"app");
const routes=[];
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())walk(p);else if(ent.name==="page.tsx"||ent.name==="route.ts"){let rel=path.relative(app,dir).replaceAll(path.sep,"/");let route="/"+rel;route=route.replace(/\/$/,"")||"/";routes.push({route,type:ent.name==="page.tsx"?"page":"api"})}}}
walk(app);
routes.sort((a,b)=>a.route.localeCompare(b.route)||a.type.localeCompare(b.type));
for(const item of routes)console.log(`${item.type.padEnd(4)} ${item.route}`);
console.log(`\nTotal app routes: ${routes.length} (${routes.filter(x=>x.type==="page").length} pages, ${routes.filter(x=>x.type==="api").length} API routes)`);
