import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/lib/db/schema";
import { applyMigrations } from "@/lib/db/migrate";
import type { MeinDb } from "@/lib/db/types";

export type { MeinDb };

export function createTestDb(): { db: MeinDb; close: () => void } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mein-"));
  const file = path.join(dir, "test.db");
  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  applyMigrations(sqlite);
  const db = drizzle(sqlite, { schema });
  return {
    db,
    close: () => {
      sqlite.close();
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}
