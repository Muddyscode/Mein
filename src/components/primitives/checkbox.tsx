"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  error?: string;
};

export function Checkbox({
  label,
  error,
  id,
  className,
  ...props
}: CheckboxProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-fg"
      >
        <input
          id={inputId}
          type="checkbox"
          className={cn(
            "h-4 w-4 rounded-sm border-line bg-elevated accent-accent",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
            className,
          )}
          {...props}
        />
        {label}
      </label>
      {error ? <span className="text-sm text-danger">{error}</span> : null}
    </div>
  );
}
