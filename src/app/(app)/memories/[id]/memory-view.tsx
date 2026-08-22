"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/patterns/page-header";
import { TagChip } from "@/components/patterns/tag-chip";
import { Button } from "@/components/primitives/button";
import { EmptyState } from "@/components/primitives/empty-state";
import { Modal } from "@/components/primitives/modal";
import { MemoryCardSkeleton } from "@/components/primitives/skeleton";
import { useToast } from "@/components/primitives/toast";
import { api, ApiRequestError } from "@/lib/api/client";
import type { MemoryDto } from "@/lib/domain/types";

export function MemoryView({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const [memory, setMemory] = useState<MemoryDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void api<{ data: MemoryDto }>(`/api/v1/memories/${id}`)
      .then((result) => {
        if (cancelled) {
          return;
        }
        setMemory(result.data);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Could not load memory.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [id, tick]);

  function load() {
    setMemory(null);
    setTick((value) => value + 1);
  }

  async function archive() {
    setBusy(true);
    try {
      await api(`/api/v1/memories/${id}`, { method: "DELETE" });
      toast.push("success", "Archived.");
      router.push("/library");
    } catch (err) {
      toast.push(
        "error",
        err instanceof ApiRequestError ? err.message : "Could not archive.",
      );
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  }

  if (error) {
    return (
      <EmptyState
        title={error}
        action={
          <Button variant="secondary" onClick={load}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!memory) {
    return <MemoryCardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <PageHeader
          title={memory.title}
          description={new Date(memory.ingestedAt).toLocaleString()}
          action={
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirm(true)}
            >
              Archive
            </Button>
          }
        />
        <article className="whitespace-pre-wrap text-base leading-[1.6] text-fg">
          {memory.body}
        </article>
      </div>
      <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-72">
        <section className="flex flex-col gap-2">
          <h2 className="text-sm text-muted">Source</h2>
          <p className="font-mono text-sm text-fg">
            {memory.source?.type ?? "—"}
          </p>
          {memory.source?.originUrl ? (
            <a
              href={memory.source.originUrl}
              className="break-all text-sm text-accent"
            >
              {memory.source.originUrl}
            </a>
          ) : null}
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-sm text-muted">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {memory.tags?.length ? (
              memory.tags.map((tag) => (
                <TagChip key={tag.id} name={tag.name} />
              ))
            ) : (
              <span className="text-sm text-faint">None</span>
            )}
          </div>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-sm text-muted">Threads</h2>
          <div className="flex flex-wrap gap-2">
            {memory.threads?.length ? (
              memory.threads.map((thread) => (
                <TagChip key={thread.id} name={thread.name} />
              ))
            ) : (
              <span className="text-sm text-faint">None</span>
            )}
          </div>
        </section>
      </aside>
      <Modal
        open={confirm}
        onOpenChange={setConfirm}
        title="Archive this memory?"
        description="It leaves the library. You can still find it with status=archived on the API."
      >
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={busy} onClick={() => void archive()}>
            Archive
          </Button>
        </div>
      </Modal>
    </div>
  );
}
