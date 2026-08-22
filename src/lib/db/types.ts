import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type * as schema from "@/lib/db/schema";

export type MeinDb = BetterSQLite3Database<typeof schema>;
