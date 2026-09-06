import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base="https://www.aceexchange.io";
  const routes=["/","/markets","/trading","/convert","/buy","/sell","/wallet","/card","/creator","/community","/governance","/ai","/kat","/marketplace","/developers","/institutional","/about","/security","/support","/status","/fees","/transparency","/terms","/privacy","/risk-disclosure","/aml","/card-terms","/cookie-policy"];
  return routes.map((path)=>({url:base+path,lastModified:new Date(),changeFrequency:path==="/"?"weekly":"monthly",priority:path==="/"?1:path.startsWith("/legal")?0.4:0.7}));
}
