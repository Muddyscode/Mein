import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDb, type MeinDb } from "@/lib/db/test-db";
import { users } from "@/lib/db/schema";
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
  verifyApiKey,
} from "./keys";

let db: MeinDb;
let close: () => void;

beforeEach(() => {
  process.env.AUTH_SECRET = "test-auth-secret-with-32-bytes-min";
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

describe("API keys", () => {
  it("returns the plaintext key once and verifies it", () => {
    const created = createApiKey(db, "user_test_1", "lab");
    expect(created.key.startsWith("mein_")).toBe(true);
    expect(created.keyPrefix).toBe(created.key.slice(0, 12));
    expect(listApiKeys(db, "user_test_1")[0]?.keyPrefix).toBe(created.keyPrefix);
    const auth = verifyApiKey(db, created.key);
    expect(auth?.userId).toBe("user_test_1");
  });

  it("rejects a revoked key", () => {
    const created = createApiKey(db, "user_test_1", "lab");
    revokeApiKey(db, "user_test_1", created.id);
    expect(verifyApiKey(db, created.key)).toBeNull();
  });
});
