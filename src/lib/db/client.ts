import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/db/schema";
import { applyMigrations } from "@/lib/db/migrate";

function resolveDbPath(): string {
  const raw = process.env.DATABASE_URL ?? "file:./data/dev.db";
  const filePath = raw.startsWith("file:") ? raw.slice("file:".length) : raw;
  return path.resolve(process.cwd(), filePath);
}

function createSqlite(): Database.Database {
  const dbPath = resolveDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  applyMigrations(sqlite);
  return sqlite;
}

const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
};

const sqlite = globalForDb.sqlite ?? createSqlite();
if (process.env.NODE_ENV !== "production") {
  globalForDb.sqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });
export { sqlite };
