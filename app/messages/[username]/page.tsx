"use client";

import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { fetcher } from "@/lib/api-client";
import { useAuth } from "@/lib/contexts/AuthContext";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
};

export default function ChatPage() {
  const params = useParams<{ username: string }>();
  const { user } = useAuth();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Lightweight polling instead of a WebSocket: refetches every 4s while
  // the chat is open. Good enough for a demo-scale chat without standing
  // up a separate realtime server.
  const { data, mutate } = useSWR<{ messages: Message[] }>(
    `/api/messages/${params.username}`,
    fetcher,
    { refreshInterval: 4000 }
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages.length]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);

    try {
      const res = await fetch(`/api/messages/${params.username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: draft.trim() }),
      });
      if (res.ok) {
        setDraft("");
        mutate();
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="flex h-[calc(100vh-57px)] flex-col">
      <div className="border-b border-ink-700 px-5 py-3">
        <h1 className="font-semibold text-mist-100">@{params.username}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {data?.messages.map((m) => {
          const isMine = m.senderId === user?.id;
          return (
            <div key={m.id} className={`mb-2 flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                  isMine ? "bg-pulse text-white" : "bg-ink-700 text-mist-100"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 border-t border-ink-700 px-5 py-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
          maxLength={1000}
          className="flex-1 rounded-full border border-ink-600 bg-ink-800 px-4 py-2 text-sm text-mist-100 outline-none focus:border-pulse"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="rounded-full bg-pulse px-4 py-2 text-sm font-semibold text-white hover:bg-pulse-dim disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </main>
  );
}
