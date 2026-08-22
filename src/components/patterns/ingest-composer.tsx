"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Textarea } from "@/components/primitives/textarea";
import { useToast } from "@/components/primitives/toast";
import { api, ApiRequestError } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import type { MemoryDto, SourceDto, SourceType } from "@/lib/domain/types";

const tabs: { id: SourceType; label: string }[] = [
  { id: "paste", label: "Paste" },
  { id: "markdown", label: "Markdown" },
  { id: "url", label: "URL" },
];

export function IngestComposer() {
  const router = useRouter();
  const toast = useToast();
  const [type, setType] = useState<SourceType>("paste");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [tagNames, setTagNames] = useState("");
  const [loading, setLoading] = useState(false);
  const [filed, setFiled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setLoading(true);
    setError(null);
    try {
      const tags = tagNames
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const payload =
        type === "url"
          ? {
              type: "url" as const,
              url,
              title: title || undefined,
              tagNames: tags.length ? tags : undefined,
            }
          : {
              type,
              content,
              title: title || undefined,
              tagNames: tags.length ? tags : undefined,
            };
      const result = await api<{ data: { source: SourceDto; memory: MemoryDto } }>(
        "/api/v1/ingest",
        { method: "POST", body: JSON.stringify(payload) },
      );
      setFiled(true);
      toast.push("success", "Filed.");
      window.setTimeout(() => {
        router.push(`/memories/${result.data.memory.id}`);
      }, 400);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        const existing =
          typeof err.details?.existingMemoryId === "string"
            ? err.details.existingMemoryId
            : null;
        setError(err.message);
        toast.push("error", err.message);
        if (existing) {
          window.setTimeout(() => router.push(`/memories/${existing}`), 600);
        }
      } else {
        setError("Could not ingest.");
        toast.push("error", "Could not ingest.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
    >
      <div className="flex gap-2" role="tablist" aria-label="Source type">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={type === tab.id}
            className={cn(
              "h-11 rounded-md px-4 text-sm",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              type === tab.id
                ? "bg-surface text-fg border border-line"
                : "text-muted hover:bg-surface",
            )}
            onClick={() => setType(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <Input
        label="Title"
        name="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Optional — derived from the source if blank"
      />
      {type === "url" ? (
        <Input
          label="URL"
          name="url"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://"
          required
        />
      ) : (
        <Textarea
          label={type === "markdown" ? "Markdown" : "Content"}
          name="content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={
            type === "markdown"
              ? "# Heading\n\nWrite in markdown."
              : "Paste anything."
          }
          required
        />
      )}
      <Input
        label="Tags"
        name="tags"
        value={tagNames}
        onChange={(event) => setTagNames(event.target.value)}
        placeholder="comma separated"
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex items-center gap-3">
        <Button type="submit" loading={loading}>
          File
        </Button>
        {filed ? (
          <span className="text-sm text-success" aria-live="polite">
            ✓
          </span>
        ) : null}
      </div>
    </form>
  );
}
