"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "@/components/patterns/sidebar-nav";
import { IconButton } from "@/components/primitives/icon-button";
import { KeyboardShortcuts } from "@/components/layouts/keyboard-shortcuts";
import { cn } from "@/lib/cn";

type AppShellProps = {
  children: React.ReactNode;
  inspector?: React.ReactNode;
};

export function AppShell({ children, inspector }: AppShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <KeyboardShortcuts />
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-8 border-r border-subtle bg-elevated p-4 lg:flex">
          <Brand />
          <SidebarNav />
          <p className="mt-auto text-xs text-faint">Personal API for knowledge.</p>
        </aside>

        {open ? (
          <div className="fixed inset-0 z-30 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-bg/80"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
            />
            <aside className="relative flex h-full w-64 flex-col gap-8 border-r border-subtle bg-elevated p-4">
              <div className="flex items-center justify-between">
                <Brand />
                <IconButton label="Close menu" onClick={() => setOpen(false)}>
                  <X size={18} />
                </IconButton>
              </div>
              <SidebarNav onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-subtle px-4 py-2 lg:hidden">
            <IconButton label="Open menu" onClick={() => setOpen(true)}>
              <Menu size={18} />
            </IconButton>
            <Brand />
          </div>
          <div className="flex min-w-0 flex-1">
            <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
              {children}
            </main>
            {inspector ? (
              <aside
                className={cn(
                  "hidden w-80 shrink-0 border-l border-subtle bg-elevated p-6 lg:block",
                )}
              >
                {inspector}
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link
      href="/library"
      className="font-display text-2xl italic text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      Mein
    </Link>
  );
}
