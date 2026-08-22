"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/patterns/page-header";
import { Button } from "@/components/primitives/button";
import { useToast } from "@/components/primitives/toast";
import { api } from "@/lib/api/client";

type SessionUser = { id: string; email: string; name: string };

export function SettingsView() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    void api<{ data: { user: SessionUser } }>("/api/auth/session")
      .then((payload) => {
        if (!cancelled) {
          setUser(payload.data.user);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function downloadExport() {
    try {
      const payload = await api<unknown>("/api/v1/export");
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "mein-export.json";
      link.click();
      URL.revokeObjectURL(url);
      toast.push("success", "Export downloaded.");
    } catch {
      toast.push("error", "Export failed.");
    }
  }

  async function signOut() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Settings" description="Account, export, sign out." />
      <section className="flex flex-col gap-2">
        <h2 className="text-sm text-muted">Account</h2>
        <p className="text-fg">{user?.name ?? "—"}</p>
        <p className="font-mono text-sm text-muted">{user?.email ?? "—"}</p>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-sm text-muted">Export</h2>
        <p className="text-sm text-muted">
          JSON of memories, threads, tags, and sources. No key hashes.
        </p>
        <Button variant="secondary" onClick={() => void downloadExport()}>
          Download export
        </Button>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-sm text-muted">Session</h2>
        <Button variant="ghost" onClick={() => void signOut()}>
          Sign out
        </Button>
      </section>
    </div>
  );
}
