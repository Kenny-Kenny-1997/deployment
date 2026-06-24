import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";

/**
 * Returns one row per person the current user has exchanged messages
 * with, each with their most recent message and an unread count.
 *
 * This is intentionally done with a raw-ish two-step query rather than
 * a single Prisma query: Prisma doesn't have a built-in "group by
 * conversation partner, take latest" primitive, and trying to fake it
 * with groupBy would lose the message content. Pulling all messages
 * for the user and reducing in JS is simple and is fine at the message
 * volumes a single MySQL instance handles comfortably; if this needs
 * to scale further, a dedicated Conversation table (last_message_id,
 * updated_at) updated on write would avoid scanning message history
 * on every load.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = requireAuthUser(req);

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: auth.sub }, { receiverId: auth.sub }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, username: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, username: true, name: true, avatarUrl: true } },
      },
    });

    const conversations = new Map<
      string,
      {
        user: { id: string; username: string; name: string; avatarUrl: string | null };
        lastMessage: string;
        lastMessageAt: string;
        unreadCount: number;
      }
    >();

    for (const m of messages) {
      const isIncoming = m.receiverId === auth.sub;
      const other = isIncoming ? m.sender : m.receiver;

      const existing = conversations.get(other.id);
      if (!existing) {
        conversations.set(other.id, {
          user: other,
          lastMessage: m.content,
          lastMessageAt: m.createdAt.toISOString(),
          unreadCount: isIncoming && !m.isRead ? 1 : 0,
        });
      } else if (isIncoming && !m.isRead) {
        existing.unreadCount += 1;
      }
    }

    return NextResponse.json({
      conversations: Array.from(conversations.values()),
    });
  } catch (error) {
    return handleApiError(error);
  }
}