import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getAuthSecret } from "@/lib/env";
import { newId } from "@/lib/db/ids";
import { apiKeys } from "@/lib/db/schema";
import type { MeinDb } from "@/lib/db/types";
import { notFound } from "@/lib/api/errors";
import { toIso } from "@/lib/domain/map";

export type ApiKeyDto = {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

function hashApiKey(key: string): string {
  return createHmac("sha256", getAuthSecret()).update(key).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export function createApiKey(
  db: MeinDb,
  userId: string,
  name: string,
): ApiKeyDto & { key: string } {
  const key = `mein_${randomBytes(32).toString("base64url")}`;
  const keyPrefix = key.slice(0, 12);
  const id = newId();
  const now = new Date();
  db.insert(apiKeys)
    .values({
      id,
      userId,
      name: name.trim(),
      keyPrefix,
      keyHash: hashApiKey(key),
      lastUsedAt: null,
      revokedAt: null,
      createdAt: now,
    })
    .run();
  return {
    id,
    name: name.trim(),
    keyPrefix,
    lastUsedAt: null,
    revokedAt: null,
    createdAt: toIso(now),
    key,
  };
}

export function listApiKeys(db: MeinDb, userId: string): ApiKeyDto[] {
  return db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .orderBy(desc(apiKeys.createdAt))
    .all()
    .map((row) => ({
      id: row.id,
      name: row.name,
      keyPrefix: row.keyPrefix,
      lastUsedAt: row.lastUsedAt ? toIso(row.lastUsedAt) : null,
      revokedAt: row.revokedAt ? toIso(row.revokedAt) : null,
      createdAt: toIso(row.createdAt),
    }));
}

export function revokeApiKey(db: MeinDb, userId: string, id: string): void {
  const existing = db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)))
    .get();
  if (!existing) {
    throw notFound("API key not found.");
  }
  if (existing.revokedAt) {
    return;
  }
  db.update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(eq(apiKeys.id, id))
    .run();
}

export function verifyApiKey(
  db: MeinDb,
  key: string,
): { userId: string; keyId: string } | null {
  if (!key.startsWith("mein_")) {
    return null;
  }
  const prefix = key.slice(0, 12);
  const expected = hashApiKey(key);
  const candidates = db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.keyPrefix, prefix), isNull(apiKeys.revokedAt)))
    .all();
  for (const row of candidates) {
    if (safeEqualHex(row.keyHash, expected)) {
      const stale =
        !row.lastUsedAt || Date.now() - row.lastUsedAt.getTime() > 60_000;
      if (stale) {
        db.update(apiKeys)
          .set({ lastUsedAt: new Date() })
          .where(eq(apiKeys.id, row.id))
          .run();
      }
      return { userId: row.userId, keyId: row.id };
    }
  }
  return null;
}
