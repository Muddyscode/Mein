"use client";

import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
};

export function Select({
  label,
  error,
  options,
  id,
  className,
  ...props
}: SelectProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <label className="flex flex-col gap-2" htmlFor={inputId}>
      <span className="text-sm text-muted">{label}</span>
      <select
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={cn(
          "h-11 rounded-md border bg-elevated px-3 text-sm text-fg",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          error ? "border-danger" : "border-line",
          "disabled:opacity-40",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <span id={errorId} className="text-sm text-danger">
          {error}
        </span>
      ) : null}
    </label>
  );
}
