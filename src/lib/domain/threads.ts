import { and, asc, count, desc, eq, max } from "drizzle-orm";
import { newId } from "@/lib/db/ids";
import { memories, threadMemories, threads } from "@/lib/db/schema";
import type { MeinDb } from "@/lib/db/types";
import { notFound } from "@/lib/api/errors";
import { memoryDto, toIso } from "@/lib/domain/map";
import type { MemoryDto, ThreadDto } from "@/lib/domain/types";

export function listThreads(db: MeinDb, userId: string): ThreadDto[] {
  const rows = db
    .select({
      thread: threads,
      memoryCount: count(threadMemories.memoryId),
    })
    .from(threads)
    .leftJoin(threadMemories, eq(threadMemories.threadId, threads.id))
    .where(eq(threads.userId, userId))
    .groupBy(threads.id)
    .orderBy(desc(threads.createdAt))
    .all();
  return rows.map((row) => ({
    id: row.thread.id,
    name: row.thread.name,
    description: row.thread.description,
    createdAt: toIso(row.thread.createdAt),
    updatedAt: toIso(row.thread.updatedAt),
    memoryCount: Number(row.memoryCount),
  }));
}

export function createThread(
  db: MeinDb,
  userId: string,
  input: { name: string; description?: string },
): ThreadDto {
  const now = new Date();
  const id = newId();
  db.insert(threads)
    .values({
      id,
      userId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return getThread(db, userId, id).thread;
}

export function getThread(
  db: MeinDb,
  userId: string,
  id: string,
): { thread: ThreadDto; memories: MemoryDto[] } {
  const thread = db
    .select()
    .from(threads)
    .where(and(eq(threads.id, id), eq(threads.userId, userId)))
    .get();
  if (!thread) {
    throw notFound("Thread not found.");
  }
  const rows = db
    .select({ memory: memories, position: threadMemories.position })
    .from(threadMemories)
    .innerJoin(memories, eq(threadMemories.memoryId, memories.id))
    .where(eq(threadMemories.threadId, id))
    .orderBy(asc(threadMemories.position))
    .all();
  return {
    thread: {
      id: thread.id,
      name: thread.name,
      description: thread.description,
      createdAt: toIso(thread.createdAt),
      updatedAt: toIso(thread.updatedAt),
      memoryCount: rows.length,
    },
    memories: rows.map((row) => memoryDto(row.memory)),
  };
}

export function updateThread(
  db: MeinDb,
  userId: string,
  id: string,
  patch: { name?: string; description?: string | null },
): ThreadDto {
  const existing = db
    .select()
    .from(threads)
    .where(and(eq(threads.id, id), eq(threads.userId, userId)))
    .get();
  if (!existing) {
    throw notFound("Thread not found.");
  }
  db.update(threads)
    .set({
      name: patch.name?.trim() ?? existing.name,
      description:
        patch.description === undefined
          ? existing.description
          : patch.description,
      updatedAt: new Date(),
    })
    .where(eq(threads.id, id))
    .run();
  return getThread(db, userId, id).thread;
}

export function deleteThread(db: MeinDb, userId: string, id: string): void {
  const existing = db
    .select()
    .from(threads)
    .where(and(eq(threads.id, id), eq(threads.userId, userId)))
    .get();
  if (!existing) {
    throw notFound("Thread not found.");
  }
  db.delete(threads).where(eq(threads.id, id)).run();
}

export function attachMemory(
  db: MeinDb,
  userId: string,
  threadId: string,
  memoryId: string,
): { threadId: string; memoryId: string; position: number; created: boolean } {
  const thread = db
    .select()
    .from(threads)
    .where(and(eq(threads.id, threadId), eq(threads.userId, userId)))
    .get();
  if (!thread) {
    throw notFound("Thread not found.");
  }
  const memory = db
    .select()
    .from(memories)
    .where(and(eq(memories.id, memoryId), eq(memories.userId, userId)))
    .get();
  if (!memory) {
    throw notFound("Memory not found.");
  }
  const existing = db
    .select()
    .from(threadMemories)
    .where(
      and(
        eq(threadMemories.threadId, threadId),
        eq(threadMemories.memoryId, memoryId),
      ),
    )
    .get();
  if (existing) {
    return {
      threadId,
      memoryId,
      position: existing.position,
      created: false,
    };
  }
  const row = db
    .select({ value: max(threadMemories.position) })
    .from(threadMemories)
    .where(eq(threadMemories.threadId, threadId))
    .get();
  const position = (row?.value ?? 0) + 1;
  db.insert(threadMemories)
    .values({ threadId, memoryId, position })
    .run();
  return { threadId, memoryId, position, created: true };
}

export function detachMemory(
  db: MeinDb,
  userId: string,
  threadId: string,
  memoryId: string,
): void {
  const thread = db
    .select()
    .from(threads)
    .where(and(eq(threads.id, threadId), eq(threads.userId, userId)))
    .get();
  if (!thread) {
    throw notFound("Thread not found.");
  }
  db.delete(threadMemories)
    .where(
      and(
        eq(threadMemories.threadId, threadId),
        eq(threadMemories.memoryId, memoryId),
      ),
    )
    .run();
}
