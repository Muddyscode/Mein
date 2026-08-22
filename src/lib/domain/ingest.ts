import { and, eq, max } from "drizzle-orm";
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
import { deriveSummary, deriveTitle } from "@/lib/domain/derive";
import { contentHash, type SourceKind } from "@/lib/domain/hash";
import { memoryDto, sourceDto } from "@/lib/domain/map";
import type { MemoryDto, SourceDto } from "@/lib/domain/types";
import { fetchUrlText } from "@/lib/domain/url-text";

export type IngestInput = {
  type: SourceKind;
  title?: string;
  content?: string;
  url?: string;
  tagNames?: string[];
  threadId?: string;
};

export async function ingestSource(
  db: MeinDb,
  userId: string,
  input: IngestInput,
): Promise<{ source: SourceDto; memory: MemoryDto }> {
  let originUrl: string | null = input.url ?? null;
  let rawContent = input.content ?? "";
  let fallbackTitle = input.title;

  if (input.type === "url") {
    if (!input.url) {
      throw validationError("A URL is required.");
    }
    if (!rawContent.trim()) {
      try {
        const fetched = await fetchUrlText(input.url);
        rawContent = fetched.text;
        originUrl = fetched.originUrl;
        fallbackTitle = fallbackTitle ?? fetched.title;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "URL fetch failed.";
        persistFailedSource(db, userId, input.url, message);
        throw validationError(message);
      }
    }
  } else if (!rawContent.trim()) {
    throw validationError("Content is required.");
  }

  const hash = contentHash(input.type, originUrl, rawContent);
  const existing = db
    .select()
    .from(sources)
    .where(and(eq(sources.userId, userId), eq(sources.contentHash, hash)))
    .get();
  if (existing) {
    const memory = db
      .select()
      .from(memories)
      .where(eq(memories.sourceId, existing.id))
      .get();
    throw validationError("This source is already filed.", {
      existingSourceId: existing.id,
      existingMemoryId: memory?.id ?? null,
    });
  }

  const title = deriveTitle(fallbackTitle, rawContent);
  const body = rawContent;
  const summary = deriveSummary(body);
  const now = new Date();
  const sourceId = newId();
  const memoryId = newId();

  db.transaction((tx) => {
    tx.insert(sources)
      .values({
        id: sourceId,
        userId,
        type: input.type,
        title,
        originUrl,
        rawContent,
        contentHash: hash,
        status: "ready",
        errorMessage: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    tx.insert(memories)
      .values({
        id: memoryId,
        userId,
        sourceId,
        title,
        body,
        summary,
        status: "active",
        createdAt: now,
        updatedAt: now,
        ingestedAt: now,
      })
      .run();
    attachTags(tx, userId, memoryId, input.tagNames ?? [], now);
    if (input.threadId) {
      attachThread(tx, userId, input.threadId, memoryId);
    }
  });

  const source = db.select().from(sources).where(eq(sources.id, sourceId)).get();
  const memory = db.select().from(memories).where(eq(memories.id, memoryId)).get();
  if (!source || !memory) {
    throw new Error("Ingest did not persist.");
  }
  return { source: sourceDto(source), memory: memoryDto(memory) };
}

function persistFailedSource(
  db: MeinDb,
  userId: string,
  url: string,
  message: string,
): void {
  const now = new Date();
  db.insert(sources)
    .values({
      id: newId(),
      userId,
      type: "url",
      title: url,
      originUrl: url,
      rawContent: url,
      contentHash: contentHash("url", url, url),
      status: "failed",
      errorMessage: message,
      createdAt: now,
      updatedAt: now,
    })
    .run();
}

function attachTags(
  tx: MeinDb,
  userId: string,
  memoryId: string,
  names: string[],
  now: Date,
): void {
  const seen = new Set<string>();
  for (const raw of names) {
    const name = raw.trim();
    if (!name) {
      continue;
    }
    const nameNormalized = name.toLowerCase();
    if (seen.has(nameNormalized)) {
      continue;
    }
    seen.add(nameNormalized);
    let tag = tx
      .select()
      .from(tags)
      .where(
        and(eq(tags.userId, userId), eq(tags.nameNormalized, nameNormalized)),
      )
      .get();
    if (!tag) {
      const id = newId();
      tx.insert(tags)
        .values({
          id,
          userId,
          name,
          nameNormalized,
          color: null,
          createdAt: now,
          updatedAt: now,
        })
        .run();
      tag = tx.select().from(tags).where(eq(tags.id, id)).get();
    }
    if (tag) {
      tx.insert(memoryTags)
        .values({ memoryId, tagId: tag.id })
        .onConflictDoNothing()
        .run();
    }
  }
}

function attachThread(
  tx: MeinDb,
  userId: string,
  threadId: string,
  memoryId: string,
): void {
  const thread = tx
    .select()
    .from(threads)
    .where(and(eq(threads.id, threadId), eq(threads.userId, userId)))
    .get();
  if (!thread) {
    throw notFound("Thread not found.");
  }
  const row = tx
    .select({ value: max(threadMemories.position) })
    .from(threadMemories)
    .where(eq(threadMemories.threadId, threadId))
    .get();
  const position = (row?.value ?? 0) + 1;
  tx.insert(threadMemories)
    .values({ threadId, memoryId, position })
    .onConflictDoNothing()
    .run();
}
