import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser, ForbiddenError } from "@/lib/auth";
import { updatePostSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-error";

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const auth = requireAuthUser(req);

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true, username: true, name: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId: auth.sub }, select: { id: true } },
      },
    });

    if (!post || post.isRemoved) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      post: {
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        author: post.author,
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        likedByMe: post.likes.length > 0,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const auth = requireAuthUser(req);
    const body = await req.json();
    const data = updatePostSchema.parse(body);

    const existing = await prisma.post.findUnique({ where: { id: params.id } });
    if (!existing || existing.isRemoved) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Only the author (or a moderator/admin) can edit a post.
    if (existing.authorId !== auth.sub && auth.role === "USER") {
      throw new ForbiddenError("You can only edit your own posts");
    }

    const post = await prisma.post.update({
      where: { id: params.id },
      data: { content: data.content },
      include: {
        author: { select: { id: true, username: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const auth = requireAuthUser(req);

    const existing = await prisma.post.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isOwner = existing.authorId === auth.sub;
    const isModerator = auth.role === "MODERATOR" || auth.role === "ADMIN";

    if (!isOwner && !isModerator) {
      throw new ForbiddenError("You can only delete your own posts");
    }

    // Moderators "soft remove" (content moderation, keeps audit trail);
    // the author themselves hard-deletes their own post.
    if (isModerator && !isOwner) {
      await prisma.post.update({
        where: { id: params.id },
        data: { isRemoved: true },
      });
    } else {
      await prisma.post.delete({ where: { id: params.id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
