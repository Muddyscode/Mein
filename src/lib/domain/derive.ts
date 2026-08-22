export function deriveTitle(
  explicit: string | undefined,
  content: string,
): string {
  const trimmed = explicit?.trim();
  if (trimmed) {
    return trimmed.slice(0, 120);
  }
  const heading = content.match(/^#{1,6}\s+(.+)$/m);
  const fromHeading = heading?.[1]?.trim();
  if (fromHeading) {
    return fromHeading.slice(0, 120);
  }
  const first = content.split(/\r?\n/).find((line) => line.trim());
  if (first) {
    return first.trim().slice(0, 120);
  }
  return "Untitled";
}

export function deriveSummary(body: string): string {
  return body.replace(/\s+/g, " ").trim().slice(0, 240);
}
