import { Badge } from "@/components/primitives/badge";

export function TagChip({ name }: { name: string }) {
  const tone = name.toLowerCase() === "demo" ? "demo" : "muted";
  return <Badge tone={tone}>{name}</Badge>;
}
