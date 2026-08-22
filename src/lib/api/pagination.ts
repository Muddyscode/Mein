import { validationError } from "@/lib/api/errors";

export function parseLimit(raw: string | null, fallback = 20): number {
  if (!raw) {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    throw validationError("limit must be an integer from 1 to 100.");
  }
  return value;
}

export function encodeCursor(t: Date, i: string): string {
  return Buffer.from(JSON.stringify({ t: t.toISOString(), i })).toString(
    "base64url",
  );
}

export function decodeCursor(cursor: string): { t: Date; i: string } {
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    );
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "t" in parsed &&
      "i" in parsed &&
      typeof parsed.t === "string" &&
      typeof parsed.i === "string"
    ) {
      const t = new Date(parsed.t);
      if (Number.isNaN(t.getTime())) {
        throw new Error("bad date");
      }
      return { t, i: parsed.i };
    }
  } catch {
    throw validationError("Invalid cursor.");
  }
  throw validationError("Invalid cursor.");
}
