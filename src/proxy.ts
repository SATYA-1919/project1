import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/jwt";

// Middleware that protects the /dashboard routes. It checks the session cookie
// and, if the visitor isn't a logged-in organiser, sends them to /login. The
// role is part of the signed token, so there's no database call here.
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
