"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/patterns/page-header";
import { ApiPlayground } from "@/components/patterns/api-playground";
import { KeyRow } from "@/components/patterns/key-row";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Modal } from "@/components/primitives/modal";
import { useToast } from "@/components/primitives/toast";
import { api, ApiRequestError } from "@/lib/api/client";
import type { ApiKeyDto } from "@/lib/domain/keys";
import { cn } from "@/lib/cn";

const STORAGE = "mein.playgroundKey";

export function LabView() {
  const toast = useToast();
  const [keys, setKeys] = useState<ApiKeyDto[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("lab");
  const [revealed, setRevealed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [playgroundKey, setPlaygroundKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE) ?? "";
    setPlaygroundKey(stored);
    let cancelled = false;
    void api<{ data: ApiKeyDto[] }>("/api/v1/keys")
      .then((payload) => {
        if (!cancelled) {
          setKeys(payload.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setKeys([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function create() {
    setBusy(true);
    try {
      const result = await api<{ data: ApiKeyDto & { key: string } }>(
        "/api/v1/keys",
        { method: "POST", body: JSON.stringify({ name }) },
      );
      setKeys((current) => [result.data, ...current]);
      setRevealed(result.data.key);
      setCopied(false);
      sessionStorage.setItem(STORAGE, result.data.key);
      setPlaygroundKey(result.data.key);
      setOpen(false);
    } catch (err) {
      toast.push(
        "error",
        err instanceof ApiRequestError ? err.message : "Could not create key.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    try {
      await api(`/api/v1/keys/${id}`, { method: "DELETE" });
      setKeys((current) =>
        current.map((row) =>
          row.id === id ? { ...row, revokedAt: new Date().toISOString() } : row,
        ),
      );
      toast.push("success", "Key revoked.");
    } catch (err) {
      toast.push(
        "error",
        err instanceof ApiRequestError ? err.message : "Could not revoke.",
      );
    } finally {
      setConfirmId(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="API"
        description="Keys, playground, and the contract."
        action={
          <span className="flex items-center gap-2 text-sm text-muted">
            <span
              className={cn(
                "inline-block h-2 w-2 rounded-full bg-success",
                "motion-safe:animate-pulse",
              )}
              aria-hidden
            />
            live
          </span>
        }
      />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-muted">Keys</h2>
          <Button size="sm" onClick={() => setOpen(true)}>
            New key
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-xs text-faint">
              <tr>
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Prefix</th>
                <th className="py-2 font-medium">Created</th>
                <th className="py-2 font-medium">Last used</th>
                <th className="py-2 font-medium text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {keys.map((row) => (
                <KeyRow
                  key={row.id}
                  apiKey={row}
                  onRevoke={setConfirmId}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {revealed ? (
        <div className="rounded-md border border-line bg-elevated p-4">
          <p className="text-sm text-muted">Copy this now. It will not be shown again.</p>
          <p className="mt-2 break-all font-mono text-sm text-fg">{revealed}</p>
          <Button
            className="mt-3"
            size="sm"
            variant="secondary"
            onClick={() => {
              void navigator.clipboard.writeText(revealed).then(() => {
                setCopied(true);
              });
            }}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
          {copied ? (
            <p className="mt-2 text-sm text-success" aria-live="polite">
              Full key copied.
            </p>
          ) : null}
        </div>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className="text-sm text-muted">Playground</h2>
        <ApiPlayground key={playgroundKey} initialKey={playgroundKey} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm text-muted">curl</h2>
        <pre className="overflow-auto rounded-md border border-line bg-elevated p-4 font-mono text-xs text-muted">
{`curl -s -H "Authorization: Bearer mein_YOUR_KEY" \\
  $APP_URL/api/v1/memories`}
        </pre>
      </section>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="New API key"
        description="Full personal access. Shown once."
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
          />
          <Button type="submit" loading={busy}>
            Create
          </Button>
        </form>
      </Modal>

      <Modal
        open={Boolean(confirmId)}
        onOpenChange={(next) => {
          if (!next) {
            setConfirmId(null);
          }
        }}
        title="Revoke this key?"
        description="It cannot be un-revoked. Create a new one if you still need access."
      >
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => confirmId && void revoke(confirmId)}
          >
            Revoke
          </Button>
        </div>
      </Modal>
    </div>
  );
}
