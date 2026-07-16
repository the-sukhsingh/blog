import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLoginPage = pathname === "/admin/login";

  // Already authenticated → redirect away from login page to dashboard
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Not authenticated → redirect to login, preserving the intended destination
  if (!isLoginPage && !token) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Protect all /admin/* routes (including /admin/login for the already-logged-in redirect)
  // Exclude /api/auth/* so NextAuth can handle sign-in/sign-out flows without being blocked
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

