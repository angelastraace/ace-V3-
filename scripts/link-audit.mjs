import fs from "node:fs";import path from "node:path";
const root=process.cwd(),app=path.join(root,"app"),pages=[];
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory())walk(p);else if(ent.name==="page.tsx"){let rel=path.relative(app,dir).replaceAll(path.sep,"/");pages.push("/"+rel)}}}walk(app);
const normalized=pages.map((r)=>r==="/"?r:r.replace(/\/$/,""));
function exists(target){if(target==="/")return true;return normalized.some((route)=>{const rx="^"+route.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/\\\[[^/]+\\\]/g,"[^/]+")+"$";return new RegExp(rx).test(target)})}
const findings=[];const sources=[];function sourceWalk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);ent.isDirectory()?sourceWalk(p):ent.name.endsWith(".tsx")&&sources.push(p)}}sourceWalk(app);
for(const file of sources){const text=fs.readFileSync(file,"utf8");const refs=new Set();for(const m of text.matchAll(/href\s*=\s*["'](\/[A-Za-z0-9_\-\[\]\/]+)["']/g))refs.add(m[1]);for(const target of refs){if(target.startsWith("/api/")||target.startsWith("/.well-known/"))continue;if(!exists(target))findings.push(`${path.relative(root,file)} -> ${target}`)}}
if(findings.length){console.error("Broken literal internal links:\n"+findings.join("\n"));process.exit(1)}console.log(`Link audit passed across ${sources.length} TSX files and ${normalized.length} page routes.`);
