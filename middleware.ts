import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Middleware runs on the Edge Runtime, which doesn't support Node's
// `crypto` module - so it can't use the `jsonwebtoken` package that the
// rest of the app uses. `jose` is a pure Web Crypto API implementation
// that works in both environments, so it's used here specifically for
// this file.
const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);

const PROTECTED_PREFIXES = ["/feed", "/profile", "/messages", "/settings"];
const AUTH_PAGES = ["/login", "/register"];

async function isValidAccessToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, ACCESS_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token")?.value;
  const isAuthenticated = await isValidAccessToken(token);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in? Skip the login/register forms.
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/feed/:path*", "/profile/:path*", "/messages/:path*", "/settings/:path*", "/login", "/register"],
};