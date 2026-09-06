import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const isLoginPage = nextUrl.pathname === "/admin/login";
  const isApiRoute = nextUrl.pathname.startsWith("/api/admin/");

  // Already logged in and trying to access login page — redirect to dashboard
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
  }

  // Not logged in — API routes return 401 JSON; UI pages redirect to login
  if (!isLoggedIn && !isLoginPage) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Protect all /admin pages and /api/admin/* endpoints
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
