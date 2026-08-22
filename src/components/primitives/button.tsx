"use client";

import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/primitives/spinner";

const variants = {
  primary: "bg-accent text-bg hover:opacity-90 active:translate-y-px",
  secondary:
    "bg-surface text-fg border border-line hover:bg-surface-hover active:translate-y-px",
  ghost: "bg-transparent text-muted hover:bg-surface hover:text-fg",
  danger: "bg-danger text-bg hover:opacity-90 active:translate-y-px",
} as const;

const sizes = {
  sm: "h-9 min-h-9 px-3 text-sm",
  md: "h-11 min-h-11 px-4 text-sm",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  href?: string;
};

function buttonClassName(
  variant: keyof typeof variants,
  size: keyof typeof sizes,
  className?: string,
): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
    "disabled:pointer-events-none disabled:opacity-40",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  type = "button",
  href,
  ...props
}: ButtonProps) {
  const classes = buttonClassName(variant, size, className);
  if (href) {
    return (
      <Link href={href} className={classes} aria-busy={loading || undefined}>
        {loading ? <Spinner size="sm" /> : null}
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : null}
      {children}
    </button>
  );
}
