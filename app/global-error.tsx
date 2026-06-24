"use client";

import { useEffect } from "react";

// Next.js renders this automatically for any render error thrown below
// the root layout. Kept free of imports from the app's own providers
// (AuthContext, etc.) since those may be exactly what crashed.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-ink-900 text-mist-100 antialiased font-body">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-mist-100/60">
            The error has been logged. You can try again.
          </p>
          <button
            onClick={() => reset()}
            className="rounded-full bg-mist-100 px-6 py-2 text-sm font-medium text-ink-900"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
