import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
};

export function Card({
  interactive = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-line bg-surface shadow-elevation-1",
        interactive &&
          "transition-colors hover:bg-surface-hover hover:border-line",
        className,
      )}
      {...props}
    />
  );
}
