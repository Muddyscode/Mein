import { AppError } from "@/lib/api/errors";

const hits = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs = 60_000,
): void {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((ts) => now - ts < windowMs);
  if (recent.length >= limit) {
    throw new AppError("rate_limited", "Too many requests.", 429, {
      retryAfter: Math.ceil(windowMs / 1000),
    });
  }
  recent.push(now);
  hits.set(key, recent);
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  return "local";
}
