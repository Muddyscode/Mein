import { cn } from "@/lib/cn";

type SpinnerProps = {
  size?: "sm" | "md";
  className?: string;
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
        size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
        className,
      )}
      aria-hidden
    />
  );
}
