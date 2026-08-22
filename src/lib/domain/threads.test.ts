import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb, type MeinDb } from "@/lib/db/test-db";
import { users } from "@/lib/db/schema";
import { ingestSource } from "./ingest";
import { attachMemory, createThread, detachMemory, getThread } from "./threads";

let db: MeinDb;
let close: () => void;

beforeEach(() => {
  const handle = createTestDb();
  db = handle.db;
  close = handle.close;
  const now = new Date();
  db.insert(users)
    .values({
      id: "user_test_1",
      email: "ada@mein.local",
      passwordHash: "x",
      name: "Ada",
      createdAt: now,
      updatedAt: now,
    })
    .run();
});

afterEach(() => {
  close();
});

describe("threads", () => {
  it("attaches and detaches a memory in order", async () => {
    const memory = await ingestSource(db, "user_test_1", {
      type: "note",
      content: "A point in the argument.",
    });
    const thread = createThread(db, "user_test_1", {
      name: "Thesis",
      description: "Ordered notes.",
    });
    const attached = attachMemory(
      db,
      "user_test_1",
      thread.id,
      memory.memory.id,
    );
    expect(attached.created).toBe(true);
    expect(attached.position).toBe(1);
    expect(getThread(db, "user_test_1", thread.id).memories).toHaveLength(1);
    detachMemory(db, "user_test_1", thread.id, memory.memory.id);
    expect(getThread(db, "user_test_1", thread.id).memories).toHaveLength(0);
  });
});
