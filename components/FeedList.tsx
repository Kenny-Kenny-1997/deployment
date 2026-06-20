"use client";

import useSWRInfinite from "swr/infinite";
import { fetcher, Post } from "@/lib/api-client";
import { PostCard } from "./PostCard";

type FeedPage = { posts: Post[]; nextCursor: string | null };

export function FeedList() {
  const { data, error, isLoading, size, setSize } = useSWRInfinite<FeedPage>(
    (pageIndex, previousPageData) => {
      if (previousPageData && !previousPageData.nextCursor) return null;
      if (pageIndex === 0) return "/api/posts?limit=10";
      return `/api/posts?limit=10&cursor=${previousPageData?.nextCursor}`;
    },
    fetcher
  );

  const posts = data ? data.flatMap((page) => page.posts) : [];
  const hasMore = data ? data[data.length - 1]?.nextCursor !== null : true;
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");

  if (error) {
    return (
      <div className="px-5 py-10 text-center text-mist-400">
        Something went wrong loading the feed. Try refreshing.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-0">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse border-b border-ink-700 px-5 py-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-ink-700" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 rounded bg-ink-700" />
                <div className="h-3 w-full rounded bg-ink-700" />
                <div className="h-3 w-2/3 rounded bg-ink-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-lg font-semibold text-mist-100">No posts yet</p>
        <p className="mt-1 text-sm text-mist-400">
          Be the first to share what&apos;s happening.
        </p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasMore && (
        <div className="px-5 py-6 text-center">
          <button
            onClick={() => setSize(size + 1)}
            disabled={isLoadingMore}
            className="rounded-full border border-ink-600 px-5 py-2 text-sm font-medium text-mist-200 transition-colors hover:border-pulse hover:text-pulse disabled:opacity-50"
          >
            {isLoadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
