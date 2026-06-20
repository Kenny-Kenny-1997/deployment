# Platform Insights

## Why a social platform, and what it actually tests

The six domain options all point at the same underlying skill: secure,
reliable backend integration. A social platform turned out to be a good
vehicle for that because almost every "enterprise" requirement maps onto a
feature that's intuitive to reason about:

- **Real-time-feeling data** → the feed (cursor pagination, optimistic
  likes).
- **Compliance/audit concerns** → content moderation (`isFlagged`,
  `isRemoved`, the `Report` model) instead of HIPAA/PCI-style rules.
- **Multi-tenancy-shaped problems** → not literal tenants, but the same
  "who's allowed to do what" question shows up in follow privacy and
  comment/post ownership checks.

## Data fetching

Two different fetching strategies ended up living side by side, and seeing
them next to each other was the most useful part of this step:

- **`useSWR` / `useSWRInfinite`** for anything the user is actively
  scrolling through or polling (feed, profile, chat). SWR's revalidation
  model means a "load more" click or 4-second poll never has to manually
  manage a loading flag — that comes for free.
- **Server Actions** for anything that's a one-shot mutation tied to a
  form (creating a post, editing a profile). These don't need client-side
  cache management because `revalidatePath` does the equivalent of cache
  invalidation on the server, and the form keeps working even if
  JavaScript fails to load.

The lesson that stuck: data fetching isn't one decision you make for the
whole app, it's a decision you make per interaction shape. A feed wants a
cache; a "create post" button wants a clean server round-trip.

## Optimistic UI and race conditions

Likes are the clearest example. The like button flips instantly client-side
before the request resolves, then rolls back only on failure. The trap
this avoids: if you wait for the server response before updating the UI,
the button feels laggy, but if you update *and forget to roll back on
error*, the UI silently drifts from the database. The fix here is small —
keep the previous value in scope and reset to it in the `catch` — but it's
easy to skip under deadline pressure, and skipping it is exactly the kind
of bug that only shows up in production under bad network conditions.

The unique constraint on `(postId, userId)` in the `Like` table is the
other half of this: even if two rapid clicks both reach the server, the
database — not the application code — is the thing that actually prevents
a duplicate like. Application-level "check then insert" logic always has
a race window; a DB constraint doesn't.

## Authentication from scratch

Building JWT auth manually (rather than reaching for NextAuth) made a few
things concrete that are easy to wave hands at otherwise:

- **Access vs. refresh tokens aren't just "two tokens," they're two
  different trust lifetimes.** A 15-minute access token limits the blast
  radius if it's ever stolen from a log or a buggy client; the 7-day
  refresh token trades that off against not forcing a re-login every 15
  minutes.
- **httpOnly cookies vs. `Authorization` headers** aren't an either/or —
  supporting both lets the same API serve a browser app (cookie, immune
  to JS-based token theft) and a future mobile/API client (header) without
  two separate auth systems.
- **Returning the same error for "no such user" and "wrong password"**
  is a small thing that's easy to skip, but it closes an account
  enumeration path that a more naive implementation leaves open.

## Things I'd do differently at real scale

- Swap the in-memory rate limiter for Redis the moment this runs on more
  than one instance — right now a second server instance means the rate
  limit is trivially bypassed by hitting it instead.
- Replace polling in the message thread with a real push channel once
  message volume or user count makes a 4-second delay actually
  noticeable.
- Add audit logging on moderation actions (who removed which post and
  why) — the schema has the room for it (`Report.status`) but the API
  doesn't yet write a structured trail.
