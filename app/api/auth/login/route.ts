import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { loginSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-error";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed } = rateLimit(`login:${ip}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again in a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { identifier, password } = loginSchema.parse(body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
      },
    });

    // Same error for "no user" and "wrong password" - don't leak which one
    // it was, that's an account enumeration vector.
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const accessToken = signAccessToken({
      sub: user.id,
      username: user.username,
      role: user.role,
    });
    const refreshToken = signRefreshToken({ sub: user.id });

    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });

    res.cookies.set(ACCESS_COOKIE, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15, // 15 minutes
    });

    res.cookies.set(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error) {
    return handleApiError(error);
  }
}
