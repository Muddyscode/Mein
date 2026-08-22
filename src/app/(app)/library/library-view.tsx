"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/patterns/page-header";
import { MemoryCard } from "@/components/patterns/memory-card";
import { EmptyState } from "@/components/primitives/empty-state";
import { Button } from "@/components/primitives/button";
import { MemoryCardSkeleton } from "@/components/primitives/skeleton";
import { api, ApiRequestError } from "@/lib/api/client";
import type { MemoryDto } from "@/lib/domain/types";

export function LibraryView() {
  const [memories, setMemories] = useState<MemoryDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void api<{ data: MemoryDto[] }>("/api/v1/memories")
      .then((result) => {
        if (cancelled) {
          return;
        }
        setMemories(result.data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Could not load library.",
        );
        setMemories([]);
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  function load() {
    setMemories(null);
    setTick((value) => value + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Library"
        description="Everything you have filed."
        action={<Button href="/ingest">Ingest</Button>}
      />
      {memories === null ? (
        <div className="flex flex-col gap-3">
          <MemoryCardSkeleton />
          <MemoryCardSkeleton />
        </div>
      ) : error ? (
        <EmptyState
          title={error}
          action={
            <Button variant="secondary" onClick={load}>
              Retry
            </Button>
          }
        />
      ) : memories.length === 0 ? (
        <EmptyState
          title="Nothing filed yet."
          description="Ingest a paste, a note, markdown, or a URL. The API will remember it."
          action={<Button href="/ingest">Ingest your first source</Button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {memories.map((memory, index) => (
            <MemoryCard key={memory.id} memory={memory} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
