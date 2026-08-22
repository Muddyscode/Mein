import Link from "next/link";
import { Card } from "@/components/primitives/card";
import { TagChip } from "@/components/patterns/tag-chip";
import type { MemoryDto } from "@/lib/domain/types";

export function MemoryCard({ memory }: { memory: MemoryDto }) {
  const demo = memory.tags?.some((tag) => tag.name.toLowerCase() === "demo");
  return (
    <Link href={`/memories/${memory.id}`} className="block">
      <Card interactive className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base text-fg">{memory.title}</h2>
          {demo ? <TagChip name="demo" /> : null}
        </div>
        {memory.summary ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted">
            {memory.summary}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          {memory.tags
            ?.filter((tag) => tag.name.toLowerCase() !== "demo")
            .map((tag) => (
              <TagChip key={tag.id} name={tag.name} />
            ))}
          <span className="ml-auto font-mono text-xs text-faint">
            {new Date(memory.ingestedAt).toLocaleString()}
          </span>
        </div>
      </Card>
    </Link>
  );
}
