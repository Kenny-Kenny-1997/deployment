import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { createPostSchema, paginationSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-error";

// GET /api/posts?cursor=<id>&limit=10
// Cursor-based pagination instead of offset/skip: stays fast and stable
// even as new posts are inserted between page loads (offset pagination
// would shift results and could duplicate/skip rows).
export async function GET(req: NextRequest) {
  try {
    const auth = requireAuthUser(req);
    const url = new URL(req.url);
    const { cursor, limit } = paginationSchema.parse({
      cursor: url.searchParams.get("cursor") || undefined,
      limit: url.searchParams.get("limit") || undefined,
    });

    const posts = await prisma.post.findMany({
      where: { isRemoved: false },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, username: true, name: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId: auth.sub }, select: { id: true } },
      },
    });

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, -1) : posts;

    const data = items.map((p: typeof items[number]) => ({
      id: p.id,
      content: p.content,
      imageUrl: p.imageUrl,
      createdAt: p.createdAt,
      author: p.author,
      likeCount: p._count.likes,
      commentCount: p._count.comments,
      likedByMe: p.likes.length > 0,
    }));

    return NextResponse.json({
      posts: data,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuthUser(req);
    const body = await req.json();
    const data = createPostSchema.parse(body);

    const post = await prisma.post.create({
      data: {
        content: data.content,
        imageUrl: data.imageUrl ?? null,
        authorId: auth.sub,
      },
      include: {
        author: { select: { id: true, username: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
