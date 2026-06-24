"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { PulseDot } from "@/components/PulseDot";

// useSearchParams() forces this component to bail out of static
// rendering, which Next.js requires to happen inside a <Suspense>
// boundary (otherwise `next build` fails with "useSearchParams()
// should be wrapped in a suspense boundary"). Splitting the form out
// from the page shell lets the shell (logo, layout) stay static while
// only this part defers to the client.
function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/feed";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const result = await login(identifier, password);
    setPending(false);

    if (!result.success) {
      setError(result.error || "Login failed");
      return;
    }
    router.push(redirectTo);
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-mist-100">Log in</h1>
      <p className="mt-1 text-sm text-mist-400">Welcome back. Catch up on what you missed.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-mist-200">
            Email or username
          </label>
          <input
            id="identifier"
            type="text"
            required
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-mist-100 outline-none focus:border-pulse"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-mist-200">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-mist-100 outline-none focus:border-pulse"
          />
        </div>

        {error && <p className="text-sm text-pulse">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-pulse px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pulse-dim disabled:opacity-50"
        >
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-mist-400">
        New here?{" "}
        <Link href="/register" className="font-medium text-pulse hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <PulseDot />
        <span className="font-display text-xl font-bold text-mist-100">Pulse</span>
      </Link>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
