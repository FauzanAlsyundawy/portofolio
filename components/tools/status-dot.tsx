import { cn } from "@/lib/utils";

export type StatusLevel = "good" | "warn" | "critical" | "idle" | "running";

interface StatusDotProps {
  status: StatusLevel;
  className?: string;
  title?: string;
}

export function StatusDot({ status, className, title }: StatusDotProps) {
  return (
    <span
      className={cn("inline-flex items-center justify-center relative", className)}
      title={title || status}
      aria-label={`Status: ${status}`}
    >
      {status === "running" && (
        <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-signal opacity-75 animate-ping" />
      )}
      <span
        className={cn(
          "inline-block h-2 w-2 rounded-full transition-colors",
          status === "idle" && "bg-muted/40",
          status === "running" && "bg-signal animate-pulse",
          status === "good" && "bg-status-up",
          status === "warn" && "bg-status-warn",
          status === "critical" && "bg-status-critical"
        )}
      />
    </span>
  );
}
