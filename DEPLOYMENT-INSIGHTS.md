# Deployment Insights — Pulse

## Two secrets, not one

Pulse signs access and refresh tokens with **separate** secrets
(`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`). That split matters for
deployment, not just code structure: if the access secret ever leaks
(e.g. logged accidentally, or exposed in a misconfigured error page),
it can be rotated in Vercel's environment variables without
invalidating every user's refresh token — meaning logged-in sessions
survive the rotation and only short-lived access tokens need to be
re-minted. A single shared secret would force everyone to log in again
on every rotation. This is also why both variables had to be added
explicitly to the CI build step — Prisma generating successfully isn't
enough; `lib/jwt.ts` throws at import time if either secret is
missing, so the production build itself would fail without them.

## Edge Runtime is a real constraint, not boilerplate

`middleware.ts` already uses `jose` instead of `jsonwebtoken`, with a
comment explaining the Edge Runtime doesn't support Node's `crypto`
module. Worth being precise about why this matters for deployment:
Vercel runs Next.js middleware on its edge network by default, so this
isn't a workaround for local dev — it's a hard requirement for the
deployed app to start at all. The rest of the app's API routes run in
the normal Node runtime and keep using `jsonwebtoken` freely, which is
why `lib/jwt.ts` was left untouched.

## Health check has to use the same Prisma singleton

`app/api/health/route.ts` imports `prisma` from `@/lib/prisma` rather
than instantiating a new `PrismaClient`. The existing comment in
`lib/prisma.ts` explains why a second client wasn't created here:
Next.js dev mode hot-reloads modules, and a second `PrismaClient`
instance would double the connection pool pressure for no benefit —
the singleton already exists specifically to prevent that.

## Why TiDB Serverless over PlanetScale

The Prisma schema's `datasource db { provider = "mysql" }` line is the
deciding constraint. PlanetScale, the database most commonly paired
with Prisma + Vercel tutorials, stopped offering a free tier in 2024 —
checking their current pricing page directly (rather than trusting
search results, several of which incorrectly claim a free tier still
exists) confirmed paid plans now start at $5/month minimum. TiDB
Serverless speaks the same MySQL wire protocol, so `schema.prisma`
needs zero changes, and it has a genuine free tier. Switching to a
Postgres-based free-tier provider (Neon, Supabase) was considered and
rejected — it would mean rewriting `provider = "mysql"` and revalidating
every raw query, for no functional gain over a working schema.

## What CI actually validates vs. what it can't

`ci.yml`'s build step uses a dummy `DATABASE_URL` and dummy JWT
secrets. This is intentional, not a shortcut: `next build` needs
Prisma's generated client to exist and the JWT module to import
without throwing, but it never opens a real database connection during
build — `prisma.post.findMany()` calls in API routes aren't executed
until a request comes in at runtime. So CI catches type errors,
missing env vars, and build-breaking syntax issues, but it cannot catch
"the production database is unreachable" — that's exactly what
`/api/health` exists to catch instead, continuously, after deploy.

## Production approval gate matches the existing two-remote workflow

Pulse already pushes to two remotes (`origin/dev` for Qwasar,
`github/main` for GitHub). `deploy.yml` mirrors that split: pushes to
`dev` auto-deploy to a staging environment, while `main` deploys to
production only after a manual approval in GitHub's `production`
Environment settings. This means the existing branch discipline
doubles as the deployment safety mechanism, instead of requiring a
new process to remember.

## Open questions for future iterations

- `lib/rate-limit.ts` is in-memory and per-instance, which the file's
  own comment already flags as a limitation for multi-server
  deployments — Vercel's serverless functions don't guarantee
  request-to-instance affinity, so under real concurrent load this
  undercounts abuse. Upstash Redis (HTTP-based, works from serverless
  functions) is the natural next step, and wouldn't require changing
  the `rateLimit(key, limit, windowMs)` call sites.
- Messaging's 4-second polling (noted as a known limitation in
  README.md) will generate steady background load once deployed with
  real users — worth watching in the `/api/metrics` data before
  deciding whether WebSockets are actually necessary yet.
