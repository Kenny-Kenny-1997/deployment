import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser, ForbiddenError } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-error";

type Params = { params: { username: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const auth = requireAuthUser(req);

    const user = await prisma.user.findUnique({
      where: { username: params.username },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        _count: { select: { followers: true, following: true, posts: true } },
        followers: { where: { followerId: auth.sub }, select: { id: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        followerCount: user._count.followers,
        followingCount: user._count.following,
        postCount: user._count.posts,
        followedByMe: user.followers.length > 0,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const auth = requireAuthUser(req);

    const target = await prisma.user.findUnique({
      where: { username: params.username },
      select: { id: true },
    });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (target.id !== auth.sub) {
      throw new ForbiddenError("You can only edit your own profile");
    }

    const body = await req.json();
    const data = updateProfileSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: auth.sub },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
