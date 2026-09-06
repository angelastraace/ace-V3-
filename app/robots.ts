import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules:[{userAgent:"*",allow:"/",disallow:["/admin/","/api/admin/","/settings/","/dashboard","/profile","/notifications","/verification","/transactions","/orders","/wallet/deposit","/wallet/withdraw","/card/manage","/card/apply","/login","/register","/forgot-password","/reset-password","/verify-email"]}],
    sitemap:"https://www.aceexchange.io/sitemap.xml",
  };
}
