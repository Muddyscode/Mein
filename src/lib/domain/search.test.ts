import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb, type MeinDb } from "@/lib/db/test-db";
import { users } from "@/lib/db/schema";
import { ingestSource } from "./ingest";
import { listMemories } from "./memories";

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

describe("FTS search", () => {
  it("finds a memory by a rare word in the body", async () => {
    await ingestSource(db, "user_test_1", {
      type: "paste",
      title: "Quiet note",
      content: "The xylophone remains in the archive.",
    });
    const found = listMemories(db, "user_test_1", {
      q: "xylophone",
      limit: 20,
    });
    expect(found.data).toHaveLength(1);
    expect(found.data[0]?.title).toBe("Quiet note");
  });

  it("does not 500 on FTS operator junk", () => {
    expect(() =>
      listMemories(db, "user_test_1", { q: 'AND OR "" hello', limit: 20 }),
    ).not.toThrow();
  });
});
