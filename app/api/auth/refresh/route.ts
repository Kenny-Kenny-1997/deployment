import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, signAccessToken } from "@/lib/jwt";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return NextResponse.json(
      { error: "Refresh token expired or invalid" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const accessToken = signAccessToken({
    sub: user.id,
    username: user.username,
    role: user.role,
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  return res;
}
