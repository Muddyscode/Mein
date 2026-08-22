import { cn } from "@/lib/cn";

const tones = {
  muted: "bg-surface text-muted border-line",
  accent: "bg-accent-muted/40 text-accent border-accent-muted",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  danger: "bg-danger/10 text-danger border-danger/30",
  demo: "bg-paper/10 text-paper border-paper/20",
} as const;

type BadgeProps = {
  tone?: keyof typeof tones;
  children: React.ReactNode;
  className?: string;
};

export function Badge({ tone = "muted", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
