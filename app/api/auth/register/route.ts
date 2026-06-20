import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-error";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed } = rateLimit(`register:${ip}`, 5, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Try again in a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email or username already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: passwordHash,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
