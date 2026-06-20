"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createPostAction, PostActionResult } from "@/app/actions/post";
import { useAuth } from "@/lib/contexts/AuthContext";

const initialState: PostActionResult = { success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-pulse px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-pulse-dim disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Posting…" : "Post"}
    </button>
  );
}

export function PostComposer() {
  const { user } = useAuth();
  const [state, formAction] = useFormState(createPostAction, initialState);

  if (!user) return null;

  return (
    <form
      action={formAction}
      className="border-b border-ink-700 px-5 py-4"
      // Reset the textarea after a successful client-enhanced submit.
      onSubmit={(e) => {
        const form = e.currentTarget;
        requestAnimationFrame(() => {
          if (state.success) form.reset();
        });
      }}
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-700 text-sm font-semibold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <textarea
            name="content"
            placeholder="What's happening right now?"
            rows={3}
            maxLength={2000}
            required
            className="w-full resize-none bg-transparent text-[15px] text-mist-100 placeholder-mist-400 outline-none"
          />
          {state.fieldErrors?.content && (
            <p className="mt-1 text-sm text-pulse">{state.fieldErrors.content[0]}</p>
          )}
          {state.error && !state.fieldErrors && (
            <p className="mt-1 text-sm text-pulse">{state.error}</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-mist-400">Visible to everyone</span>
            <SubmitButton />
          </div>
        </div>
      </div>
    </form>
  );
}
