import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import { can, protectedRouteFor } from "./lib/permissions";

const { auth } = NextAuth(authConfig);

/**
 * Lớp bảo vệ thứ nhất (chặn sớm, trải nghiệm tốt).
 * Trang /admin và mọi Server Action VẪN tự kiểm tra quyền — xem lib/session.ts, lib/actions.ts.
 */
export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const rule = protectedRouteFor(pathname);
  if (!rule) return NextResponse.next();

  const user = req.auth?.user;
  if (!user) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(login);
  }

  if (!can(user.role, rule.action)) {
    const forbidden = new URL("/403", req.nextUrl.origin);
    forbidden.searchParams.set("from", pathname);
    return NextResponse.redirect(forbidden);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
