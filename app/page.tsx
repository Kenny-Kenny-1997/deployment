"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { PulseDot } from "@/components/PulseDot";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) router.replace("/feed");
  }, [isLoading, user, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <PulseDot size="md" />
      <h1 className="mt-6 font-display text-5xl font-bold tracking-tight text-mist-100 sm:text-6xl">
        Pulse
      </h1>
      <p className="mt-4 max-w-md text-lg text-mist-300">
        A social feed built around what&apos;s happening right now — not what
        happened last week.
      </p>

      <div className="mt-8 flex gap-3">
        <Link
          href="/register"
          className="rounded-full bg-pulse px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-pulse-dim"
        >
          Create account
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-ink-600 px-6 py-3 text-sm font-semibold text-mist-100 transition-colors hover:border-mist-400"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}
