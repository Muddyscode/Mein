import fs from "node:fs";
import path from "node:path";
import type Database from "better-sqlite3";

export function applyMigrations(sqlite: Database.Database): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id text PRIMARY KEY NOT NULL,
      applied_at integer NOT NULL
    );
  `);

  const dir = path.join(process.cwd(), "drizzle");
  if (!fs.existsSync(dir)) {
    return;
  }
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const applied = new Set(
    sqlite
      .prepare("SELECT id FROM _migrations")
      .all()
      .map((row) => (row as { id: string }).id),
  );

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    sqlite.exec("BEGIN");
    try {
      sqlite.exec(sql);
      sqlite
        .prepare("INSERT INTO _migrations (id, applied_at) VALUES (?, ?)")
        .run(file, Date.now());
      sqlite.exec("COMMIT");
    } catch (error) {
      sqlite.exec("ROLLBACK");
      throw error;
    }
  }
}
