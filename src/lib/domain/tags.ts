import { and, eq } from "drizzle-orm";
import { newId } from "@/lib/db/ids";
import { tags } from "@/lib/db/schema";
import type { MeinDb } from "@/lib/db/types";
import { tagDto } from "@/lib/domain/map";
import type { TagDto } from "@/lib/domain/types";

export function listTags(db: MeinDb, userId: string): TagDto[] {
  return db
    .select()
    .from(tags)
    .where(eq(tags.userId, userId))
    .all()
    .map(tagDto);
}

export function createTag(
  db: MeinDb,
  userId: string,
  name: string,
  color?: string | null,
): { tag: TagDto; created: boolean } {
  const trimmed = name.trim();
  const nameNormalized = trimmed.toLowerCase();
  const existing = db
    .select()
    .from(tags)
    .where(
      and(eq(tags.userId, userId), eq(tags.nameNormalized, nameNormalized)),
    )
    .get();
  if (existing) {
    return { tag: tagDto(existing), created: false };
  }
  const now = new Date();
  const id = newId();
  db.insert(tags)
    .values({
      id,
      userId,
      name: trimmed,
      nameNormalized,
      color: color ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  const row = db.select().from(tags).where(eq(tags.id, id)).get();
  if (!row) {
    throw new Error("Tag did not persist.");
  }
  return { tag: tagDto(row), created: true };
}
