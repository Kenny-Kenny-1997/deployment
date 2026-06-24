"use client";

import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/api-client";

type Conversation = {
  user: { id: string; username: string; name: string; avatarUrl: string | null };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function MessagesIndexPage() {
  const { data, isLoading } = useSWR<{ conversations: Conversation[] }>(
    "/api/messages/conversations",
    fetcher,
    { refreshInterval: 5000 }
  );

  return (
    <main>
      <div className="border-b border-ink-700 px-5 py-3">
        <h1 className="font-display text-lg font-bold text-mist-100">Messages</h1>
      </div>

      {isLoading && (
        <div className="px-5 py-10 text-center text-mist-400">Loading conversations…</div>
      )}

      {!isLoading && data?.conversations.length === 0 && (
        <div className="px-5 py-16 text-center">
          <p className="text-lg font-semibold text-mist-100">No conversations yet</p>
          <p className="mt-1 text-sm text-mist-400">
            Visit someone&apos;s profile and send them a message to get started.
          </p>
        </div>
      )}

      <div>
        {data?.conversations.map((c) => (
          <Link
            key={c.user.id}
            href={`/messages/${c.user.username}`}
            className="flex items-center gap-3 border-b border-ink-700 px-5 py-3 transition-colors hover:bg-ink-800/40"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink-700 text-sm font-semibold text-mist-100">
              {c.user.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-semibold text-mist-100">{c.user.name}</span>
                <span className="shrink-0 text-xs text-mist-400">{timeAgo(c.lastMessageAt)}</span>
              </div>
              <p className="truncate text-sm text-mist-400">{c.lastMessage}</p>
            </div>

            {c.unreadCount > 0 && (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-pulse px-1.5 text-xs font-semibold text-white">
                {c.unreadCount}
              </span>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}
