import { NextResponse, type NextRequest } from "next/server";
import { currentServerSession } from "./lib/server-auth";

const protectedPrefixes = [
  "/account", "/dashboard", "/profile", "/settings", "/notifications", "/verification",
  "/transactions", "/orders", "/wallet/deposit", "/wallet/withdraw", "/wallet/address-book",
  "/card/manage", "/card/apply", "/creator-hub", "/governance/vote", "/admin",
  "/api/orders", "/api/wallet", "/api/fiat", "/api/card", "/api/kyc", "/api/governance/vote", "/api/community/post", "/api/creator/payout",
];

function isProtected(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}


export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!isProtected(pathname)) return NextResponse.next();

  const session = await currentServerSession(request);
  if (!session.authenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ status:"unauthorized", reason:session.reason }, { status:401, headers:{"cache-control":"no-store"} });
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    login.searchParams.set("reason", session.reason);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/admin")) {
    const previewReviewerAdmin = session.userId === "preview-reviewer:admin";
    if (!previewReviewerAdmin && process.env.ENABLE_ADMIN_DASHBOARD !== "true") return new NextResponse("Not Found", { status:404 });
    const allowed = (process.env.AUTH_ADMIN_ROLES || "admin,super_admin").split(",").map((v) => v.trim()).filter(Boolean);
    if (!previewReviewerAdmin && !session.roles.some((role: string) => allowed.includes(role))) return new NextResponse("Forbidden", { status:403 });
  }

  const response = NextResponse.next();
  response.headers.set("x-ace-authenticated", "1");
  return response;
}

export const config = {
  matcher: [
    "/account/:path*", "/dashboard/:path*", "/profile/:path*", "/settings/:path*", "/notifications/:path*", "/verification/:path*",
    "/transactions/:path*", "/orders/:path*", "/wallet/deposit/:path*", "/wallet/withdraw/:path*", "/wallet/address-book/:path*",
    "/card/manage/:path*", "/card/apply/:path*", "/creator-hub/:path*", "/governance/vote/:path*", "/admin/:path*",
    "/api/orders/:path*", "/api/wallet/:path*", "/api/fiat/:path*", "/api/card/:path*", "/api/kyc/:path*", "/api/governance/vote/:path*", "/api/community/post/:path*", "/api/creator/payout/:path*",
  ],
};
