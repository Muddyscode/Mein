import { describe, expect, it } from "vitest";
import { buildFtsMatch } from "./fts-query";

describe("buildFtsMatch", () => {
  it("returns null for empty or whitespace", () => {
    expect(buildFtsMatch("")).toBeNull();
    expect(buildFtsMatch("   ")).toBeNull();
  });

  it("ANDs quoted terms and strips operators", () => {
    expect(buildFtsMatch('hello "world"')).toBe('"hello" AND "world"');
    expect(buildFtsMatch("foo AND bar OR baz")).toBe(
      '"foo" AND "bar" AND "baz"',
    );
  });

  it("escapes double quotes inside a term", () => {
    expect(buildFtsMatch('say "hi')).toBe('"say" AND "hi"');
  });
});
