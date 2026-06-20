import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuthUser(req);

    const user = await prisma.user.findUnique({
      where: { id: auth.sub },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        _count: { select: { followers: true, following: true, posts: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
