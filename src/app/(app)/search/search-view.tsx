"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/patterns/page-header";
import { SearchBar } from "@/components/patterns/search-bar";
import { MemoryCard } from "@/components/patterns/memory-card";
import { EmptyState } from "@/components/primitives/empty-state";
import { MemoryCardSkeleton } from "@/components/primitives/skeleton";
import { api, ApiRequestError } from "@/lib/api/client";
import type { MemoryDto } from "@/lib/domain/types";

export function SearchView() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<MemoryDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(q.trim()), 200);
    return () => window.clearTimeout(handle);
  }, [q]);

  useEffect(() => {
    if (!debounced) {
      return;
    }
    let cancelled = false;
    void api<{ data: MemoryDto[] }>(
      `/api/v1/memories?q=${encodeURIComponent(debounced)}`,
    )
      .then((payload) => {
        if (!cancelled) {
          setResults(payload.data);
          setError(null);
          setPending(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof ApiRequestError ? err.message : "Search failed.",
          );
          setResults([]);
          setPending(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Search"
        description="Keyword search across titles and bodies."
      />
      <SearchBar
        value={q}
        onChange={(value) => {
          setQ(value);
          setPending(Boolean(value.trim()));
          if (!value.trim()) {
            setResults([]);
            setError(null);
          }
        }}
        autoFocus
      />
      {error ? (
        <EmptyState title={error} />
      ) : pending && debounced ? (
        <div className="flex flex-col gap-3">
          <MemoryCardSkeleton />
          <MemoryCardSkeleton />
        </div>
      ) : !debounced ? (
        <EmptyState title="Type a word. The index is FTS, not magic." />
      ) : results.length === 0 ? (
        <EmptyState title="Nothing matched." />
      ) : (
        <div className="flex flex-col gap-3">
          {results.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      )}
    </div>
  );
}
