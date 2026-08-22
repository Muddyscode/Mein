import { eq } from "drizzle-orm";
import { memories, sources, tags, threads } from "@/lib/db/schema";
import type { MeinDb } from "@/lib/db/types";
import { memoryDto, sourceDto, tagDto, toIso } from "@/lib/domain/map";

export function exportKnowledge(db: MeinDb, userId: string) {
  const memoryRows = db
    .select()
    .from(memories)
    .where(eq(memories.userId, userId))
    .all();
  const sourceRows = db
    .select()
    .from(sources)
    .where(eq(sources.userId, userId))
    .all();
  const tagRows = db.select().from(tags).where(eq(tags.userId, userId)).all();
  const threadRows = db
    .select()
    .from(threads)
    .where(eq(threads.userId, userId))
    .all();

  return {
    exportedAt: new Date().toISOString(),
    version: "1" as const,
    memories: memoryRows.map((row) => memoryDto(row)),
    threads: threadRows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: toIso(row.createdAt),
      updatedAt: toIso(row.updatedAt),
    })),
    tags: tagRows.map(tagDto),
    sources: sourceRows.map((row) => ({
      ...sourceDto(row),
      rawContent: row.rawContent,
    })),
  };
}
