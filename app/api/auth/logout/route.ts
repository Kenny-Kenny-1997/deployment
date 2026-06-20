import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ success: true });

  res.cookies.set(ACCESS_COOKIE, "", { maxAge: 0, path: "/" });
  res.cookies.set(REFRESH_COOKIE, "", { maxAge: 0, path: "/" });

  return res;
}
