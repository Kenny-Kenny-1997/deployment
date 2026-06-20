"use client";

import useSWR from "swr";
import { useState } from "react";
import { useParams } from "next/navigation";
import { fetcher, Profile } from "@/lib/api-client";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const { user } = useAuth();
  const { data, error, isLoading, mutate } = useSWR<{ user: Profile }>(
    `/api/users/${params.username}`,
    fetcher
  );

  const [pending, setPending] = useState(false);
  const isOwnProfile = user?.username === params.username;

  async function toggleFollow() {
    if (!data || pending) return;
    setPending(true);
    const nextFollowing = !data.user.followedByMe;

    try {
      const res = await fetch(`/api/users/${params.username}/follow`, {
        method: nextFollowing ? "POST" : "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("failed");
      const result = await res.json();
      mutate({
        user: {
          ...data.user,
          followedByMe: result.following,
          followerCount: result.followerCount,
        },
      });
    } catch {
      // leave state as-is, the button will just look unchanged
    } finally {
      setPending(false);
    }
  }

  if (isLoading) {
    return <div className="px-5 py-10 text-center text-mist-400">Loading profile…</div>;
  }

  if (error || !data) {
    return <div className="px-5 py-10 text-center text-mist-400">User not found.</div>;
  }

  const profile = data.user;

  return (
    <main className="px-5 py-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-700 text-2xl font-bold text-mist-100">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-mist-100">{profile.name}</h1>
            <p className="text-sm text-mist-400">@{profile.username}</p>
          </div>
        </div>

        {!isOwnProfile && (
          <button
            onClick={toggleFollow}
            disabled={pending}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              profile.followedByMe
                ? "border border-ink-600 text-mist-100 hover:border-pulse hover:text-pulse"
                : "bg-pulse text-white hover:bg-pulse-dim"
            } disabled:opacity-50`}
          >
            {profile.followedByMe ? "Following" : "Follow"}
          </button>
        )}
      </div>

      {profile.bio && <p className="mt-4 text-[15px] text-mist-100">{profile.bio}</p>}

      <div className="mt-4 flex gap-5 text-sm">
        <span className="text-mist-100">
          <strong>{profile.postCount}</strong>{" "}
          <span className="text-mist-400">posts</span>
        </span>
        <span className="text-mist-100">
          <strong>{profile.followerCount}</strong>{" "}
          <span className="text-mist-400">followers</span>
        </span>
        <span className="text-mist-100">
          <strong>{profile.followingCount}</strong>{" "}
          <span className="text-mist-400">following</span>
        </span>
      </div>
    </main>
  );
}
