import { createHash } from "node:crypto";

export type SourceKind = "paste" | "markdown" | "url" | "note";

export function sha256Hex(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

export function contentHash(
  type: SourceKind,
  originUrl: string | null,
  rawContent: string,
): string {
  return sha256Hex(`${type}\0${originUrl ?? ""}\0${rawContent}`);
}
