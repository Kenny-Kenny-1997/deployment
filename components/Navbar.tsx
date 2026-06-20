"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { PulseDot } from "./PulseDot";

const NAV_ITEMS = [
  { href: "/feed", label: "Feed" },
  { href: "/messages", label: "Messages" },
  { href: "/settings", label: "Settings" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-700 bg-ink-900/95 px-5 py-3 backdrop-blur">
      <Link href={user ? "/feed" : "/"} className="flex items-center gap-2">
        <PulseDot />
        <span className="font-display text-lg font-bold tracking-tight text-mist-100">
          Pulse
        </span>
      </Link>

      {user && (
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith(item.href)
                  ? "bg-ink-700 text-mist-100"
                  : "text-mist-400 hover:bg-ink-800 hover:text-mist-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={`/profile/${user.username}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              pathname.startsWith("/profile")
                ? "bg-ink-700 text-mist-100"
                : "text-mist-400 hover:bg-ink-800 hover:text-mist-100"
            }`}
          >
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="ml-2 rounded-full px-4 py-2 text-sm font-medium text-mist-400 hover:bg-ink-800 hover:text-pulse"
          >
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}
