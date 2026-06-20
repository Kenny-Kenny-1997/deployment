import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";

type Params = { params: { username: string } };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const auth = requireAuthUser(req);

    const target = await prisma.user.findUnique({
      where: { username: params.username },
      select: { id: true },
    });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (target.id === auth.sub) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    try {
      await prisma.follow.create({
        data: { followerId: auth.sub, followingId: target.id },
      });
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2002"
      ) {
        // already following - idempotent
      } else {
        throw err;
      }
    }

    const followerCount = await prisma.follow.count({
      where: { followingId: target.id },
    });

    return NextResponse.json({ following: true, followerCount });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const auth = requireAuthUser(req);

    const target = await prisma.user.findUnique({
      where: { username: params.username },
      select: { id: true },
    });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.follow.deleteMany({
      where: { followerId: auth.sub, followingId: target.id },
    });

    const followerCount = await prisma.follow.count({
      where: { followingId: target.id },
    });

    return NextResponse.json({ following: false, followerCount });
  } catch (error) {
    return handleApiError(error);
  }
}
