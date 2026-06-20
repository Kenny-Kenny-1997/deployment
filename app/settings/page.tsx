"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useAuth } from "@/lib/contexts/AuthContext";
import { updateProfileAction, ProfileActionResult } from "@/app/actions/profile";

const initialState: ProfileActionResult = { success: false };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-pulse px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-pulse-dim disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [state, formAction] = useFormState(updateProfileAction, initialState);

  if (!user) {
    return <div className="px-5 py-10 text-center text-mist-400">Loading…</div>;
  }

  return (
    <main className="px-5 py-6">
      <h1 className="text-xl font-bold text-mist-100">Settings</h1>
      <p className="mt-1 text-sm text-mist-400">Update how others see you on Pulse.</p>

      <form
        action={formAction}
        onSubmit={() => {
          // After the action resolves, pull fresh user data into context so
          // the navbar/avatar reflect the change without a full reload.
          setTimeout(() => refreshUser(), 300);
        }}
        className="mt-6 space-y-4"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-mist-200">
            Name
          </label>
          <input
            id="name"
            name="name"
            defaultValue={user.name}
            maxLength={60}
            className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-mist-100 outline-none focus:border-pulse"
          />
          {state.fieldErrors?.name && (
            <p className="mt-1 text-sm text-pulse">{state.fieldErrors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-mist-200">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={user.bio ?? ""}
            rows={3}
            maxLength={280}
            className="mt-1 w-full resize-none rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-mist-100 outline-none focus:border-pulse"
          />
          {state.fieldErrors?.bio && (
            <p className="mt-1 text-sm text-pulse">{state.fieldErrors.bio[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="avatarUrl" className="block text-sm font-medium text-mist-200">
            Avatar URL
          </label>
          <input
            id="avatarUrl"
            name="avatarUrl"
            type="url"
            defaultValue={user.avatarUrl ?? ""}
            placeholder="https://…"
            className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-mist-100 outline-none focus:border-pulse"
          />
          {state.fieldErrors?.avatarUrl && (
            <p className="mt-1 text-sm text-pulse">{state.fieldErrors.avatarUrl[0]}</p>
          )}
        </div>

        {state.success && <p className="text-sm text-signal">Changes saved.</p>}
        {state.error && !state.fieldErrors && (
          <p className="text-sm text-pulse">{state.error}</p>
        )}

        <SaveButton />
      </form>
    </main>
  );
}
