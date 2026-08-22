# Mein

Personal API for knowledge — a searchable second brain with a real HTTP API.

The API is the product. The UI is the lab that proves it.

```
npm install
copy .env.example .env
npm run dev
```

SQLite migrations in `drizzle/` apply on first boot. Schema lives in `src/lib/db/schema.ts` (Drizzle). Open `/setup` to create the single owner, then `/library`.