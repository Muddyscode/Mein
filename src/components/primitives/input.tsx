"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({
  label,
  error,
  id,
  className,
  ...props
}: InputProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <label className="flex flex-col gap-2" htmlFor={inputId}>
      <span className="text-sm text-muted">{label}</span>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(
          "h-11 rounded-md border bg-elevated px-3 text-sm text-fg",
          "placeholder:text-faint",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          error ? "border-danger" : "border-line",
          "disabled:opacity-40",
          className,
        )}
        {...props}
      />
      {error ? (
        <span id={errorId} className="text-sm text-danger">
          {error}
        </span>
      ) : null}
    </label>
  );
}
