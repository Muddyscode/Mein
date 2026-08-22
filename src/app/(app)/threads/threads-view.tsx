"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/patterns/page-header";
import { Button } from "@/components/primitives/button";
import { Card } from "@/components/primitives/card";
import { EmptyState } from "@/components/primitives/empty-state";
import { Input } from "@/components/primitives/input";
import { Modal } from "@/components/primitives/modal";
import { Textarea } from "@/components/primitives/textarea";
import { useToast } from "@/components/primitives/toast";
import { api, ApiRequestError } from "@/lib/api/client";
import type { ThreadDto } from "@/lib/domain/types";
import Link from "next/link";

export function ThreadsView() {
  const toast = useToast();
  const [threads, setThreads] = useState<ThreadDto[] | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void api<{ data: ThreadDto[] }>("/api/v1/threads")
      .then((payload) => {
        if (!cancelled) {
          setThreads(payload.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setThreads([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function create() {
    setBusy(true);
    try {
      const result = await api<{ data: ThreadDto }>("/api/v1/threads", {
        method: "POST",
        body: JSON.stringify({ name, description: description || undefined }),
      });
      setThreads((current) => [result.data, ...(current ?? [])]);
      setOpen(false);
      setName("");
      setDescription("");
      toast.push("success", "Thread created.");
    } catch (err) {
      toast.push(
        "error",
        err instanceof ApiRequestError ? err.message : "Could not create thread.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Threads"
        description="Ordered arguments. Not chats."
        action={<Button onClick={() => setOpen(true)}>New thread</Button>}
      />
      {threads === null ? null : threads.length === 0 ? (
        <EmptyState
          title="No threads yet."
          action={<Button onClick={() => setOpen(true)}>New thread</Button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {threads.map((thread) => (
            <Link key={thread.id} href={`/threads/${thread.id}`}>
              <Card interactive className="flex flex-col gap-2 p-5">
                <h2 className="text-base text-fg">{thread.name}</h2>
                {thread.description ? (
                  <p className="text-sm text-muted">{thread.description}</p>
                ) : null}
                <p className="font-mono text-xs text-faint">
                  {thread.memoryCount ?? 0} memories
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="New thread"
        description="A named sequence of memories."
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void create();
          }}
        >
          <Input
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <Button type="submit" loading={busy}>
            Create
          </Button>
        </form>
      </Modal>
    </div>
  );
}
