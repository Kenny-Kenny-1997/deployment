"use client";

import { useState } from "react";
import Link from "next/link";
import { Post } from "@/lib/api-client";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [pending, setPending] = useState(false);

  async function toggleLike() {
    if (pending) return;
    setPending(true);

    // Optimistic update: flip the UI immediately, roll back only if the
    // request actually fails. Keeps liking feeling instant.
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((c) => c + (nextLiked ? 1 : -1));

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: nextLiked ? "POST" : "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      setLiked(liked);
      setLikeCount(post.likeCount);
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="border-b border-ink-700 px-5 py-4 transition-colors hover:bg-ink-800/40">
      <div className="flex gap-3">
        <Link href={`/profile/${post.author.username}`} className="shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-700 text-sm font-semibold text-mist-100">
            {post.author.name.charAt(0).toUpperCase()}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-sm">
            <Link
              href={`/profile/${post.author.username}`}
              className="font-semibold text-mist-100 hover:underline"
            >
              {post.author.name}
            </Link>
            <span className="text-mist-400">@{post.author.username}</span>
            <span className="text-mist-400">·</span>
            <span className="text-mist-400">{timeAgo(post.createdAt)}</span>
          </div>

          <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-mist-100">
            {post.content}
          </p>

          {post.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt=""
              className="mt-3 max-h-96 w-full rounded-xl border border-ink-700 object-cover"
            />
          )}

          <div className="mt-3 flex items-center gap-6 text-mist-400">
            <button
              onClick={toggleLike}
              disabled={pending}
              aria-pressed={liked}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                liked ? "text-pulse" : "hover:text-pulse"
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>

            <Link
              href={`/posts/${post.id}`}
              className="flex items-center gap-1.5 text-sm hover:text-mist-100"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              {post.commentCount > 0 && <span>{post.commentCount}</span>}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
