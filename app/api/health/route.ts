import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/health — used by uptime monitors and Vercel to confirm the
// app and database are both reachable. Unauthenticated and unprotected
// on purpose: middleware.ts only guards /feed, /profile, /messages,
// /settings, so no change needed there.
export async function GET() {
  const checkedAt = new Date().toISOString();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { status: "ok", database: "connected", checkedAt },
      { status: 200 }
    );
  } catch (error) {
    console.error("[health-check] database unreachable:", error);
    return NextResponse.json(
      { status: "error", database: "unreachable", checkedAt },
      { status: 503 }
    );
  }
}
