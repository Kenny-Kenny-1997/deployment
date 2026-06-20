# Pulse — Enterprise Social Platform

A backend-focused social platform built for the Qwasar Enterprise Backend
Integration Platform project. Domain: **Social Platform (Meta-style)**.

## Why this domain

A social platform exercises every pattern the assignment asks for in a way
that's easy to reason about: a feed that needs cursor pagination and
real-time-ish updates, write paths (posts, comments, likes, follows,
messages) that need validation and authorization, and a natural place for
role-based access (`USER`, `MODERATOR`, `ADMIN`) via content moderation
(soft-removing reported posts).

## Stack

- **Next.js 14** (App Router, Server Components + Server Actions)
- **TypeScript** end to end
- **Prisma** ORM against **MySQL**
- **JWT auth from scratch** (access + refresh tokens, httpOnly cookies)
- **Zod** for request validation
- **SWR** (`useSWR`, `useSWRInfinite`) for client data fetching/caching
- **Tailwind CSS** for styling

## Data model

`User`, `Post`, `Comment`, `Like`, `Follow`, `Message`, `Report`. See
`prisma/schema.prisma` for the full schema, indexes, and relations.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up MySQL**

   Create a database (locally, in Docker, or with a managed provider like
   PlanetScale/Railway):

   ```sql
   CREATE DATABASE social_pulse;
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:
   - `DATABASE_URL` — your MySQL connection string
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — generate with:
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```

4. **Generate the Prisma client & push the schema**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

## Project structure

```
app/
  api/
    auth/        register, login, logout, refresh, me
    posts/       feed CRUD, like, comments
    users/       profile, follow
    messages/    direct messages between two users
  actions/       Server Actions (createPostAction, updateProfileAction)
  feed/          main feed page (protected)
  profile/[username]/
  messages/[username]/
  posts/[id]/
  settings/
  login/ register/
lib/
  prisma.ts      Prisma client singleton
  jwt.ts         sign/verify access + refresh tokens
  password.ts    bcrypt hash/compare
  auth.ts        request -> authenticated user, role guards
  api-error.ts   central error -> HTTP response mapping
  validators.ts  Zod schemas
  rate-limit.ts  in-memory rate limiter for auth endpoints
  contexts/AuthContext.tsx
middleware.ts    route protection (redirects unauthenticated users)
```

## Authentication design

- **Access token**: short-lived (15 min), sent as an httpOnly cookie *and*
  accepted via `Authorization: Bearer` header (so the same API works for
  the browser app and any external API client).
- **Refresh token**: longer-lived (7 days), httpOnly cookie only, used via
  `POST /api/auth/refresh` to mint a new access token.
- Passwords hashed with bcrypt (12 salt rounds).
- Login/register are rate-limited per IP to slow down brute-forcing.
- Role-based authorization (`USER` / `MODERATOR` / `ADMIN`) gates
  moderation actions like removing someone else's post.

## API overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Log in, sets cookies |
| POST | `/api/auth/logout` | Clear cookies |
| POST | `/api/auth/refresh` | Rotate access token |
| GET | `/api/auth/me` | Current user |
| GET | `/api/posts` | Feed, cursor-paginated |
| POST | `/api/posts` | Create post |
| GET/PUT/DELETE | `/api/posts/:id` | Read/update/delete a post |
| POST/DELETE | `/api/posts/:id/like` | Like/unlike |
| GET/POST | `/api/posts/:id/comments` | List/add comments |
| GET/PUT | `/api/users/:username` | View/edit profile |
| POST/DELETE | `/api/users/:username/follow` | Follow/unfollow |
| GET/POST | `/api/messages/:username` | Conversation thread |

## Known limitations / next steps

- Messaging uses polling (4s interval) rather than WebSockets — fine for a
  demo, would swap for a real-time transport (e.g. Pusher, or a Socket.io
  server) at scale.
- Rate limiting is in-memory and per-instance; a multi-server deployment
  would need a shared store (Redis).
- No file upload for avatars/post images yet — `avatarUrl`/`imageUrl` are
  plain URL fields.
