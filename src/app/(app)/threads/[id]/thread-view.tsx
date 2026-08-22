"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/patterns/page-header";
import { MemoryCard } from "@/components/patterns/memory-card";
import { EmptyState } from "@/components/primitives/empty-state";
import { Button } from "@/components/primitives/button";
import { api, ApiRequestError } from "@/lib/api/client";
import type { MemoryDto, ThreadDto } from "@/lib/domain/types";

type ThreadDetail = ThreadDto & { memories: MemoryDto[] };

export function ThreadView({ id }: { id: string }) {
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void api<{ data: ThreadDetail }>(`/api/v1/threads/${id}`)
      .then((payload) => {
        if (!cancelled) {
          setThread(payload.data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof ApiRequestError
              ? err.message
              : "Could not load thread.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return <EmptyState title={error} />;
  }
  if (!thread) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={thread.name}
        description={thread.description ?? "Ordered memories."}
        action={
          <Button href="/threads" variant="ghost">
            All threads
          </Button>
        }
      />
      {thread.memories.length === 0 ? (
        <EmptyState title="Nothing attached yet." />
      ) : (
        <div className="flex flex-col gap-3">
          {thread.memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      )}
    </div>
  );
}
