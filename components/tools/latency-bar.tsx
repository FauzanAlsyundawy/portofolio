import { cn } from "@/lib/utils";

interface LatencyBarProps {
  value: number | null; // RTT in ms, null if timeout or unreachable
  maxValue: number; // Highest RTT for proportional scale
  className?: string;
}

export function LatencyBar({ value, maxValue, className }: LatencyBarProps) {
  if (value === null || isNaN(value)) {
    return (
      <div className={cn("h-2.5 w-16 bg-status-critical/30 rounded-xs", className)} title="Timeout" />
    );
  }

  const safeMax = Math.max(maxValue, 10);
  const percentage = Math.min(Math.max((value / safeMax) * 100, 4), 100);

  const colorClass =
    value < 50
      ? "bg-status-up"
      : value <= 150
      ? "bg-status-warn"
      : "bg-status-critical";

  return (
    <div
      className={cn("h-2.5 w-20 sm:w-24 bg-surface border border-border/40 rounded-xs overflow-hidden flex items-center", className)}
      title={`${value.toFixed(1)} ms`}
    >
      <div
        className={cn("h-full transition-all duration-300", colorClass)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
