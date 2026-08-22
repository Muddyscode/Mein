import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("hashes and verifies a password", async () => {
    const encoded = await hashPassword("correct horse battery");
    expect(encoded.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct horse battery", encoded)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const encoded = await hashPassword("correct horse battery");
    expect(await verifyPassword("incorrect", encoded)).toBe(false);
  });

  it("rejects a malformed hash string", async () => {
    expect(await verifyPassword("anything", "not-a-hash")).toBe(false);
  });
});
