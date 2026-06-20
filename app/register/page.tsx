"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { PulseDot } from "@/components/PulseDot";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const result = await register(form);
    setPending(false);

    if (!result.success) {
      setError(result.error || "Registration failed");
      return;
    }
    router.push("/feed");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <PulseDot />
        <span className="font-display text-xl font-bold text-mist-100">Pulse</span>
      </Link>

      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-mist-100">Create your account</h1>
        <p className="mt-1 text-sm text-mist-400">Join the conversation happening now.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-mist-200">
              Name
            </label>
            <input
              id="name"
              required
              maxLength={60}
              value={form.name}
              onChange={update("name")}
              className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-mist-100 outline-none focus:border-pulse"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-mist-200">
              Username
            </label>
            <input
              id="username"
              required
              pattern="[a-zA-Z0-9_]+"
              minLength={3}
              maxLength={20}
              value={form.username}
              onChange={update("username")}
              className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-mist-100 outline-none focus:border-pulse"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-mist-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={update("email")}
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
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={update("password")}
              className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-mist-100 outline-none focus:border-pulse"
            />
            <p className="mt-1 text-xs text-mist-400">At least 8 characters</p>
          </div>

          {error && <p className="text-sm text-pulse">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-pulse px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pulse-dim disabled:opacity-50"
          >
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-mist-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-pulse hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
