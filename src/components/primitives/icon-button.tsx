"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/primitives/spinner";

const tones = {
  ghost: "text-muted hover:bg-surface hover:text-fg",
  danger: "text-danger hover:bg-surface",
} as const;

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  tone?: keyof typeof tones;
  loading?: boolean;
};

export function IconButton({
  label,
  tone = "ghost",
  loading = false,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        "disabled:pointer-events-none disabled:opacity-40",
        tones[tone],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  );
}
