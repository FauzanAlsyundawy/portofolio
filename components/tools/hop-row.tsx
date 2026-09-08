import { LatencyBar } from "./latency-bar";
import { cn } from "@/lib/utils";

export interface HopData {
  hop: number;
  ip: string;
  host: string;
  asn?: string;
  org?: string;
  rtt1: number | null;
  rtt2: number | null;
  rtt3: number | null;
}

interface HopRowProps {
  hop: HopData;
  maxRtt: number;
}

function formatRtt(val: number | null) {
  if (val === null || isNaN(val)) return "*";
  return `${val.toFixed(1)}ms`;
}

function getRttColor(val: number | null) {
  if (val === null || isNaN(val)) return "text-status-critical";
  if (val < 50) return "text-status-up";
  if (val <= 150) return "text-status-warn";
  return "text-status-critical";
}

export function HopRow({ hop, maxRtt }: HopRowProps) {
  // Average non-null RTT for bar
  const validRtts = [hop.rtt1, hop.rtt2, hop.rtt3].filter(
    (v): v is number => v !== null && !isNaN(v)
  );
  const avgRtt =
    validRtts.length > 0
      ? validRtts.reduce((a, b) => a + b, 0) / validRtts.length
      : null;

  const isTimeout = validRtts.length === 0;

  return (
    <tr className="border-b border-border/40 font-mono text-xs hover:bg-surface/50 transition-colors">
      {/* Hop Number */}
      <td className="py-2.5 px-3 font-semibold text-muted w-10 text-right">
        {hop.hop}
      </td>

      {/* IP Address */}
      <td className="py-2.5 px-3 text-ink font-medium whitespace-nowrap">
        {isTimeout && hop.ip === "*" ? (
          <span className="text-muted/60">* * *</span>
        ) : (
          <span>{hop.ip}</span>
        )}
      </td>

      {/* Hostname */}
      <td className="py-2.5 px-3 text-muted truncate max-w-[180px] sm:max-w-[240px]" title={hop.host}>
        {hop.host || "—"}
      </td>

      {/* AS & Org */}
      <td className="py-2.5 px-3 text-xs whitespace-nowrap">
        {hop.asn ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="text-signal font-semibold">{hop.asn}</span>
            {hop.org && (
              <span className="text-muted/80 text-[11px] truncate max-w-[120px]" title={hop.org}>
                {hop.org}
              </span>
            )}
          </span>
        ) : (
          <span className="text-muted/40">—</span>
        )}
      </td>

      {/* RTT 1 */}
      <td className={cn("py-2.5 px-2 text-right whitespace-nowrap", getRttColor(hop.rtt1))}>
        {formatRtt(hop.rtt1)}
      </td>

      {/* RTT 2 */}
      <td className={cn("py-2.5 px-2 text-right whitespace-nowrap", getRttColor(hop.rtt2))}>
        {formatRtt(hop.rtt2)}
      </td>

      {/* RTT 3 */}
      <td className={cn("py-2.5 px-2 text-right whitespace-nowrap", getRttColor(hop.rtt3))}>
        {formatRtt(hop.rtt3)}
      </td>

      {/* Latency Bar */}
      <td className="py-2.5 px-3 text-right">
        <div className="flex justify-end">
          <LatencyBar value={avgRtt} maxValue={maxRtt} />
        </div>
      </td>
    </tr>
  );
}
