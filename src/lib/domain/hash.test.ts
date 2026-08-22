import { describe, expect, it } from "vitest";
import { contentHash } from "./hash";

describe("contentHash", () => {
  it("is stable for the same type, url, and content", () => {
    const a = contentHash("paste", null, "hello");
    const b = contentHash("paste", null, "hello");
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it("changes when type differs", () => {
    expect(contentHash("paste", null, "hello")).not.toBe(
      contentHash("note", null, "hello"),
    );
  });

  it("changes when origin url differs", () => {
    expect(contentHash("url", "https://a.example", "hello")).not.toBe(
      contentHash("url", "https://b.example", "hello"),
    );
  });
});
