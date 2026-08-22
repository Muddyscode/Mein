"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Card } from "@/components/primitives/card";
import { TagChip } from "@/components/patterns/tag-chip";
import type { MemoryDto } from "@/lib/domain/types";

export function MemoryCard({
  memory,
  index = 0,
}: {
  memory: MemoryDto;
  index?: number;
}) {
  const reduce = useReducedMotion();
  const demo = memory.tags?.some((tag) => tag.name.toLowerCase() === "demo");
  const delay = Math.min(index, 5) * 0.04;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.16, delay: reduce ? 0 : delay }}
    >
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
    </motion.div>
  );
}
