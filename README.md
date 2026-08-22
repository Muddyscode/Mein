# Mein

Personal API for knowledge — a searchable second brain with a real HTTP surface.

The API is the product. The UI is the lab that proves it.

Mein is **not** Notion, Mem, a chatbot, a social app, or multi-tenant SaaS. One owner. Keyword search. Your data, exportable.

## Local

```
npm install
copy .env.example .env
```

Set `AUTH_SECRET` to at least 32 characters. Then:

```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). First visit creates the owner at `/setup`. Ten demo memories (tag `demo`) are filed so search is not empty.

SQLite lives at `data/dev.db` (gitignored). SQL in `drizzle/` applies on boot.

```
npm test
npm run typecheck
npm run lint
```

## Environment

| Name | Purpose |
|---|---|
| `DATABASE_URL` | SQLite path, e.g. `file:./data/dev.db` |
| `AUTH_SECRET` | ≥ 32 chars. HMAC for API keys. |
| `APP_URL` | Public origin, e.g. `http://localhost:3000` |
| `NODE_ENV` | `development` \| `production` \| `test` |

`.env.example` is committed. `.env` is not.

## Auth

- UI: email + password, httpOnly session cookie `mein_session`.
- API: `Authorization: Bearer mein_…` or the session cookie on same origin.
- Keys are hashed (HMAC-SHA256 of `AUTH_SECRET`). Plaintext is shown **once** at create.

## HTTP API

Base: `/api/v1`

Errors:

```json
{
  "error": {
    "code": "validation_error" | "unauthorized" | "forbidden" | "not_found" | "rate_limited" | "internal",
    "message": "Human sentence.",
    "details": {}
  }
}
```

Pagination: `?limit=20&cursor=…` → `{ "data": [], "nextCursor": null }`.

### curl

Create a key in **API** (`/lab`), then:

```bash
curl -s -H "Authorization: Bearer mein_YOUR_KEY" \
  http://localhost:3000/api/v1/memories
```

Ingest:

```bash
curl -s -X POST \
  -H "Authorization: Bearer mein_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"paste\",\"title\":\"via curl\",\"content\":\"hello from the API\"}" \
  http://localhost:3000/api/v1/ingest
```

Search:

```bash
curl -s -H "Authorization: Bearer mein_YOUR_KEY" \
  "http://localhost:3000/api/v1/memories?q=hello"
```

Export (no key hashes, no password hashes):

```bash
curl -s -H "Authorization: Bearer mein_YOUR_KEY" \
  http://localhost:3000/api/v1/export
```

A revoked key returns `401 unauthorized`.

### Routes

| Method | Path |
|---|---|
| POST | `/api/v1/ingest` |
| GET | `/api/v1/memories` |
| GET/PATCH/DELETE | `/api/v1/memories/:id` |
| GET/POST | `/api/v1/threads` |
| GET/PATCH/DELETE | `/api/v1/threads/:id` |
| POST | `/api/v1/threads/:id/memories` |
| DELETE | `/api/v1/threads/:id/memories/:memoryId` |
| GET/POST | `/api/v1/tags` |
| GET/POST | `/api/v1/keys` |
| DELETE | `/api/v1/keys/:id` |
| GET | `/api/v1/export` |

`DELETE /memories/:id` archives. `?hard=true` deletes.

Rate limit (in-memory, per process): 60/min per API key, 120/min per session user.

## Keyboard

- `/` focuses search
- `c` opens ingest (when you are not typing in a field)

## Limits (v1)

- Single owner. No teams, OAuth, billing, or realtime.
- No embeddings / vector DB. FTS5 keyword search.
- URL ingest is inline (8s, 1 MB). No crawler.
- SQLite file is local. **Vercel serverless will not persist it.** Production needs Postgres: keep the Drizzle schema, replace FTS5 with `tsvector` in `src/lib/domain/memories.ts` (`listMemories` is the only FTS reader).

## Stack

Next.js App Router · TypeScript strict · Tailwind v4 tokens · Drizzle + better-sqlite3 · FTS5 · Zod · Vitest

Prisma was specified; this machine cannot reach `binaries.prisma.sh`. Drizzle is the spec-allowed alternative and keeps the same tables.

## License

Private research OS. Use as you will on your own machine.
