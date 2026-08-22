import { and, desc, eq, inArray, lt, or, sql } from "drizzle-orm";
import { newId } from "@/lib/db/ids";
import {
  memories,
  memoryTags,
  sources,
  tags,
  threadMemories,
  threads,
} from "@/lib/db/schema";
import type { MeinDb } from "@/lib/db/types";
import { notFound, validationError } from "@/lib/api/errors";
import { decodeCursor, encodeCursor } from "@/lib/api/pagination";
import { deriveSummary } from "@/lib/domain/derive";
import { buildFtsMatch } from "@/lib/domain/fts-query";
import { memoryDto, sourceDto, tagDto } from "@/lib/domain/map";
import type { MemoryDto, MemoryStatus } from "@/lib/domain/types";

export type ListMemoriesQuery = {
  q?: string;
  tag?: string;
  threadId?: string;
  status?: "active" | "archived" | "all";
  limit: number;
  cursor?: string;
};

export function listMemories(
  db: MeinDb,
  userId: string,
  query: ListMemoriesQuery,
): { data: MemoryDto[]; nextCursor: string | null } {
  const status = query.status ?? "active";
  let idsFromFts: string[] | null = null;
  if (query.q) {
    const match = buildFtsMatch(query.q);
    if (!match) {
      return { data: [], nextCursor: null };
    }
    const rows = db.all<{ id: string }>(
      sql`SELECT id FROM memory_fts WHERE memory_fts MATCH ${match} AND user_id = ${userId}`,
    );
    idsFromFts = rows.map((row) => row.id);
    if (idsFromFts.length === 0) {
      return { data: [], nextCursor: null };
    }
  }

  const filters = [eq(memories.userId, userId)];
  if (status !== "all") {
    filters.push(eq(memories.status, status));
  }
  if (idsFromFts) {
    filters.push(inArray(memories.id, idsFromFts));
  }
  if (query.tag) {
    const tag = db
      .select()
      .from(tags)
      .where(
        and(
          eq(tags.userId, userId),
          eq(tags.nameNormalized, query.tag.trim().toLowerCase()),
        ),
      )
      .get();
    if (!tag) {
      return { data: [], nextCursor: null };
    }
    const linked = db
      .select({ memoryId: memoryTags.memoryId })
      .from(memoryTags)
      .where(eq(memoryTags.tagId, tag.id))
      .all()
      .map((row) => row.memoryId);
    if (linked.length === 0) {
      return { data: [], nextCursor: null };
    }
    filters.push(inArray(memories.id, linked));
  }
  if (query.threadId) {
    const linked = db
      .select({ memoryId: threadMemories.memoryId })
      .from(threadMemories)
      .where(eq(threadMemories.threadId, query.threadId))
      .all()
      .map((row) => row.memoryId);
    if (linked.length === 0) {
      return { data: [], nextCursor: null };
    }
    filters.push(inArray(memories.id, linked));
  }
  if (query.cursor) {
    const { t, i } = decodeCursor(query.cursor);
    filters.push(
      or(
        lt(memories.ingestedAt, t),
        and(eq(memories.ingestedAt, t), lt(memories.id, i)),
      )!,
    );
  }

  const rows = db
    .select()
    .from(memories)
    .where(and(...filters))
    .orderBy(desc(memories.ingestedAt), desc(memories.id))
    .limit(query.limit + 1)
    .all();

  const page = rows.slice(0, query.limit);
  const last = page[page.length - 1];
  const nextCursor =
    rows.length > query.limit && last
      ? encodeCursor(last.ingestedAt, last.id)
      : null;

  return { data: page.map((row) => memoryDto(row)), nextCursor };
}

export function getMemory(
  db: MeinDb,
  userId: string,
  id: string,
): MemoryDto {
  const row = db
    .select()
    .from(memories)
    .where(and(eq(memories.id, id), eq(memories.userId, userId)))
    .get();
  if (!row) {
    throw notFound("Memory not found.");
  }
  const source = row.sourceId
    ? db.select().from(sources).where(eq(sources.id, row.sourceId)).get()
    : undefined;
  const tagRows = db
    .select({ tag: tags })
    .from(memoryTags)
    .innerJoin(tags, eq(memoryTags.tagId, tags.id))
    .where(eq(memoryTags.memoryId, id))
    .all();
  const threadRows = db
    .select({ id: threads.id, name: threads.name })
    .from(threadMemories)
    .innerJoin(threads, eq(threadMemories.threadId, threads.id))
    .where(eq(threadMemories.memoryId, id))
    .all();
  return memoryDto(row, {
    tags: tagRows.map((item) => tagDto(item.tag)),
    threads: threadRows,
    source: source ? sourceDto(source) : undefined,
  });
}

export function updateMemory(
  db: MeinDb,
  userId: string,
  id: string,
  patch: {
    title?: string;
    body?: string;
    status?: MemoryStatus;
    tagNames?: string[];
  },
): MemoryDto {
  const existing = db
    .select()
    .from(memories)
    .where(and(eq(memories.id, id), eq(memories.userId, userId)))
    .get();
  if (!existing) {
    throw notFound("Memory not found.");
  }
  const now = new Date();
  const title = patch.title?.trim() ?? existing.title;
  const body = patch.body ?? existing.body;
  if (!title) {
    throw validationError("Title is required.");
  }
  db.transaction((tx) => {
    tx.update(memories)
      .set({
        title,
        body,
        summary: deriveSummary(body),
        status: patch.status ?? existing.status,
        updatedAt: now,
      })
      .where(eq(memories.id, id))
      .run();
    if (patch.tagNames) {
      tx.delete(memoryTags).where(eq(memoryTags.memoryId, id)).run();
      const seen = new Set<string>();
      for (const raw of patch.tagNames) {
        const name = raw.trim();
        const nameNormalized = name.toLowerCase();
        if (!name || seen.has(nameNormalized)) {
          continue;
        }
        seen.add(nameNormalized);
        let tag = tx
          .select()
          .from(tags)
          .where(
            and(
              eq(tags.userId, userId),
              eq(tags.nameNormalized, nameNormalized),
            ),
          )
          .get();
        if (!tag) {
          const tagId = newId();
          tx.insert(tags)
            .values({
              id: tagId,
              userId,
              name,
              nameNormalized,
              color: null,
              createdAt: now,
              updatedAt: now,
            })
            .run();
          tag = tx.select().from(tags).where(eq(tags.id, tagId)).get();
        }
        if (tag) {
          tx.insert(memoryTags).values({ memoryId: id, tagId: tag.id }).run();
        }
      }
    }
  });
  return getMemory(db, userId, id);
}

export function archiveMemory(
  db: MeinDb,
  userId: string,
  id: string,
): void {
  updateMemory(db, userId, id, { status: "archived" });
}

export function hardDeleteMemory(
  db: MeinDb,
  userId: string,
  id: string,
): void {
  const existing = db
    .select()
    .from(memories)
    .where(and(eq(memories.id, id), eq(memories.userId, userId)))
    .get();
  if (!existing) {
    throw notFound("Memory not found.");
  }
  const sourceId = existing.sourceId;
  db.transaction((tx) => {
    tx.delete(memories).where(eq(memories.id, id)).run();
    if (sourceId) {
      const remaining = tx
        .select()
        .from(memories)
        .where(eq(memories.sourceId, sourceId))
        .get();
      if (!remaining) {
        tx.delete(sources).where(eq(sources.id, sourceId)).run();
      }
    }
  });
}

