import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/jwt";

/**
 * Next.js 16 middleware (named `proxy`). Gates the organiser dashboard using
 * the MongoDB-issued session JWT — verified here with jose (edge-safe), no DB
 * round-trip needed since the role is a signed claim.
 */
export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path.startsWith("/dashboard")) {
    const user = await verifySessionToken(
      req.cookies.get(SESSION_COOKIE)?.value,
    );
    if (!user || user.role !== "organiser") {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
