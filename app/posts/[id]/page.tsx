"use client";

import { useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { fetcher, Post, Comment } from "@/lib/api-client";
import { PostCard } from "@/components/PostCard";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: postData, error: postError } = useSWR<{ post: Post }>(
    `/api/posts/${params.id}`,
    fetcher
  );
  const { data: commentsData, mutate: mutateComments } = useSWR<{ comments: Comment[] }>(
    `/api/posts/${params.id}/comments`,
    fetcher
  );

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);

    try {
      const res = await fetch(`/api/posts/${params.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: draft.trim() }),
      });
      if (res.ok) {
        setDraft("");
        mutateComments();
      }
    } finally {
      setSending(false);
    }
  }

  if (postError) {
    return <div className="px-5 py-10 text-center text-mist-400">Post not found.</div>;
  }

  return (
    <main>
      {postData && <PostCard post={postData.post} />}

      <form onSubmit={submitComment} className="flex gap-2 border-b border-ink-700 px-5 py-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a comment…"
          maxLength={500}
          className="flex-1 rounded-full border border-ink-600 bg-ink-800 px-4 py-2 text-sm text-mist-100 outline-none focus:border-pulse"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="rounded-full bg-pulse px-4 py-2 text-sm font-semibold text-white hover:bg-pulse-dim disabled:opacity-50"
        >
          Reply
        </button>
      </form>

      <div>
        {commentsData?.comments.map((c) => (
          <div key={c.id} className="border-b border-ink-700 px-5 py-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-mist-100">{c.author.name}</span>
              <span className="text-mist-400">@{c.author.username}</span>
            </div>
            <p className="mt-1 text-[15px] text-mist-100">{c.content}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
