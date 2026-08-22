import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BOOT_COOKIE, SESSION_COOKIE } from "@/lib/auth/cookies";

export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
  const hasBoot = req.cookies.get(BOOT_COOKIE)?.value === "1";

  if (hasSession) {
    if (pathname === "/setup" || pathname === "/login" || pathname === "/") {
      return NextResponse.redirect(new URL("/library", req.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/setup" || pathname === "/login") {
    return NextResponse.next();
  }

  if (!hasBoot) {
    return NextResponse.redirect(new URL("/setup", req.url));
  }

  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
