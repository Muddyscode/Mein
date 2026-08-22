"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { Kbd } from "@/components/primitives/kbd";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  id?: string;
};

export function SearchBar({
  value,
  onChange,
  onSubmit,
  autoFocus,
  id = "mein-search",
}: SearchBarProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex h-12 items-center gap-3 rounded-lg border border-line bg-elevated px-4",
        "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus",
      )}
    >
      <Search size={16} className="text-faint" aria-hidden />
      <input
        id={id}
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onSubmit?.();
          }
        }}
        placeholder="Search titles and bodies"
        className="h-full min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-faint"
      />
      <Kbd>/</Kbd>
    </label>
  );
}
