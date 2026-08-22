export function buildFtsMatch(q: string): string | null {
  const terms = q
    .trim()
    .split(/\s+/)
    .map((term) => term.replace(/["']/g, ""))
    .filter((term) => term.length > 0 && !/^(and|or|not)$/i.test(term));
  if (terms.length === 0) {
    return null;
  }
  return terms.map((term) => `"${term}"`).join(" AND ");
}
