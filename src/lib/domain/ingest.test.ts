import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AppError } from "@/lib/api/errors";
import { createTestDb, type MeinDb } from "@/lib/db/test-db";
import { users } from "@/lib/db/schema";
import { ingestSource } from "./ingest";
import { getMemory, listMemories, updateMemory } from "./memories";

let db: MeinDb;
let close: () => void;

beforeEach(() => {
  const handle = createTestDb();
  db = handle.db;
  close = handle.close;
});

afterEach(() => {
  close();
});

function seedUser(): string {
  const id = "user_test_1";
  const now = new Date();
  db.insert(users)
    .values({
      id,
      email: "ada@mein.local",
      passwordHash: "x",
      name: "Ada",
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return id;
}

describe("ingestSource", () => {
  it("files a paste into a ready source and active memory", async () => {
    const userId = seedUser();
    const result = await ingestSource(db, userId, {
      type: "paste",
      content: "# Filed note\n\nThe body lives here.",
    });
    expect(result.source.status).toBe("ready");
    expect(result.memory.title).toBe("Filed note");
    expect(result.memory.body).toContain("The body lives here.");
    expect(result.memory.status).toBe("active");
    const listed = listMemories(db, userId, { limit: 20 });
    expect(listed.data).toHaveLength(1);
    expect(listed.data[0]?.id).toBe(result.memory.id);
  });

  it("rejects an identical paste for the same user", async () => {
    const userId = seedUser();
    const input = { type: "paste" as const, content: "same raw" };
    const first = await ingestSource(db, userId, input);
    await expect(ingestSource(db, userId, input)).rejects.toMatchObject({
      code: "validation_error",
      details: {
        existingSourceId: first.source.id,
        existingMemoryId: first.memory.id,
      },
    });
    expect(listMemories(db, userId, { limit: 20 }).data).toHaveLength(1);
  });

  it("archives a memory so it leaves the default list", async () => {
    const userId = seedUser();
    const result = await ingestSource(db, userId, {
      type: "note",
      content: "park this",
    });
    updateMemory(db, userId, result.memory.id, { status: "archived" });
    expect(listMemories(db, userId, { limit: 20 }).data).toHaveLength(0);
    expect(getMemory(db, userId, result.memory.id).status).toBe("archived");
  });
});

describe("AppError shape", () => {
  it("is an AppError on duplicate", async () => {
    const userId = seedUser();
    await ingestSource(db, userId, { type: "paste", content: "dup" });
    try {
      await ingestSource(db, userId, { type: "paste", content: "dup" });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
    }
  });
});
