"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MessagesIndexPage() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  function goToChat(e: React.FormEvent) {
    e.preventDefault();
    if (username.trim()) router.push(`/messages/${username.trim()}`);
  }

  return (
    <main className="px-5 py-10 text-center">
      <h1 className="text-xl font-bold text-mist-100">Messages</h1>
      <p className="mt-2 text-sm text-mist-400">
        Enter a username to start or continue a conversation.
      </p>

      <form onSubmit={goToChat} className="mx-auto mt-6 flex max-w-xs gap-2">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          className="flex-1 rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-mist-100 outline-none focus:border-pulse"
        />
        <button
          type="submit"
          className="rounded-lg bg-pulse px-4 py-2 text-sm font-semibold text-white hover:bg-pulse-dim"
        >
          Go
        </button>
      </form>
    </main>
  );
}
