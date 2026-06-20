import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { createMessageSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-error";

type Params = { params: { username: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const auth = requireAuthUser(req);

    const other = await prisma.user.findUnique({
      where: { username: params.username },
      select: { id: true },
    });
    if (!other) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: auth.sub, receiverId: other.id },
          { senderId: other.id, receiverId: auth.sub },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    // Mark incoming messages as read now that the recipient has fetched them.
    await prisma.message.updateMany({
      where: { senderId: other.id, receiverId: auth.sub, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const auth = requireAuthUser(req);

    const other = await prisma.user.findUnique({
      where: { username: params.username },
      select: { id: true },
    });
    if (!other) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (other.id === auth.sub) {
      return NextResponse.json(
        { error: "You cannot message yourself" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const data = createMessageSchema.parse(body);

    const message = await prisma.message.create({
      data: {
        content: data.content,
        senderId: auth.sub,
        receiverId: other.id,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
