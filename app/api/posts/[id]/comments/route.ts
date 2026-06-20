import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { createCommentSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-error";

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    requireAuthUser(req);

    const comments = await prisma.comment.findMany({
      where: { postId: params.id },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, username: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const auth = requireAuthUser(req);
    const body = await req.json();
    const data = createCommentSchema.parse(body);

    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post || post.isRemoved) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        postId: params.id,
        authorId: auth.sub,
      },
      include: {
        author: { select: { id: true, username: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
