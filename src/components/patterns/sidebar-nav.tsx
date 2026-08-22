"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  KeyRound,
  Layers,
  Library,
  PenLine,
  Search,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Kbd } from "@/components/primitives/kbd";

const items = [
  { href: "/library", label: "Library", icon: Library },
  { href: "/search", label: "Search", icon: Search, hint: "/" },
  { href: "/threads", label: "Threads", icon: Layers },
  { href: "/ingest", label: "Ingest", icon: PenLine, hint: "c" },
  { href: "/lab", label: "API", icon: KeyRound },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

type SidebarNavProps = {
  onNavigate?: () => void;
};

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "relative flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              active
                ? "bg-surface text-fg"
                : "text-muted hover:bg-surface hover:text-fg",
            )}
            aria-current={active ? "page" : undefined}
          >
            {active ? (
              <span className="absolute top-2 bottom-2 left-0 w-0.5 rounded-full bg-accent" />
            ) : null}
            <Icon size={16} aria-hidden />
            <span className="flex-1">{item.label}</span>
            {"hint" in item && item.hint ? <Kbd>{item.hint}</Kbd> : null}
          </Link>
        );
      })}
    </nav>
  );
}
