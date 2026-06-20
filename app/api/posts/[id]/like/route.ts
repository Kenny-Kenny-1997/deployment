import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";

type Params = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const auth = requireAuthUser(req);

    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post || post.isRemoved) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Unique constraint on [postId, userId] prevents double-likes at the
    // DB level even under concurrent requests; catch and treat as no-op.
    try {
      await prisma.like.create({
        data: { postId: params.id, userId: auth.sub },
      });
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: string }).code === "P2002"
      ) {
        // Already liked - idempotent success.
      } else {
        throw err;
      }
    }

    const likeCount = await prisma.like.count({ where: { postId: params.id } });
    return NextResponse.json({ liked: true, likeCount });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const auth = requireAuthUser(req);

    await prisma.like.deleteMany({
      where: { postId: params.id, userId: auth.sub },
    });

    const likeCount = await prisma.like.count({ where: { postId: params.id } });
    return NextResponse.json({ liked: false, likeCount });
  } catch (error) {
    return handleApiError(error);
  }
}
