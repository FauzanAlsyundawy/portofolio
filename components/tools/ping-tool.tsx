"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { OutputTerminal } from "./output-terminal";
import { StatusDot } from "./status-dot";
import { Play, Square, RefreshCw, Activity } from "lucide-react";

interface PingPacket {
  seq: number;
  bytes: number;
  ttl: number;
  rtt: number | null;
  raw: string;
  isTimeout?: boolean;
}

export function PingTool() {
  const [target, setTarget] = useState("1.1.1.1");
  const [isRunning, setIsRunning] = useState(false);
  const [packets, setPackets] = useState<PingPacket[]>([]);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [summary, setSummary] = useState<{
    sent: number;
    received: number;
    lost: number;
    min: number;
    avg: number;
    max: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStartPing = async () => {
    if (!target.trim() || isRunning) return;

    setErrorMessage(null);
    setPackets([]);
    setTerminalLines([]);
    setSummary(null);
    setIsRunning(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Client-side 10-second safety timeout
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setTerminalLines((prev) => [...prev, "[!] Request timeout (10s threshold reached)"]);
        setIsRunning(false);
      }
    }, 10000);

    try {
      const response = await fetch(`/api/tools/ping?target=${encodeURIComponent(target.trim())}`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error ${response.status}`);
      }

      if (!response.body) throw new Error("ReadableStream not supported by browser.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      let currentSeq = 1;
      const collectedRtts: number[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const block of lines) {
          const trimmed = block.trim();
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(trimmed.replace(/^data: /, ""));

            if (data.error) {
              setErrorMessage(data.error);
              setTerminalLines((prev) => [...prev, `[ERROR] ${data.error}`]);
              continue;
            }

            if (data.line) {
              setTerminalLines((prev) => [...prev, data.line]);

              const lineStr = String(data.line);

              // Parse Windows & Linux ping line formats
              // Linux: 64 bytes from 1.1.1.1: icmp_seq=1 ttl=116 time=14.2 ms
              // Windows: Reply from 1.1.1.1: bytes=32 time=15ms TTL=116
              // Timeout: Request timed out.
              const isTimeout = /timed out|unreachable|loss/i.test(lineStr);

              const timeMatch = lineStr.match(/time[=<]([\d.]+)\s?ms/i);
              const ttlMatch = lineStr.match(/ttl=(\d+)/i);
              const bytesMatch = lineStr.match(/(?:bytes=|(\d+)\sbytes)/i);

              // Check if server sent parsed RTT directly (simulation mode)
              // This avoids dependency on line regex for simulated output
              const serverRtt = typeof data.rtt === "number" ? data.rtt : null;
              const serverSeq = typeof data.seq === "number" ? data.seq : null;

              if (serverRtt !== null && serverSeq !== null) {
                // Simulation mode: use server-provided values directly
                collectedRtts.push(serverRtt);
                setPackets((prev) => [
                  ...prev,
                  {
                    seq: serverSeq,
                    bytes: 64,
                    ttl: 116,
                    rtt: serverRtt,
                    raw: lineStr,
                    isTimeout: false,
                  },
                ]);
                currentSeq = serverSeq + 1;
              } else if (timeMatch || isTimeout) {
                // Live mode: parse from raw line text
                const rttVal = timeMatch ? parseFloat(timeMatch[1]) : null;
                const ttlVal = ttlMatch ? parseInt(ttlMatch[1], 10) : 64;
                const byteVal = bytesMatch ? parseInt(bytesMatch[1] || "32", 10) : 32;

                if (rttVal !== null) collectedRtts.push(rttVal);

                setPackets((prev) => [
                  ...prev,
                  {
                    seq: currentSeq++,
                    bytes: byteVal,
                    ttl: ttlVal,
                    rtt: rttVal,
                    raw: lineStr,
                    isTimeout,
                  },
                ]);
              }
            }

            if (data.done) {
              // Calculate summary
              const sent = currentSeq > 1 ? currentSeq - 1 : 5;
              const received = collectedRtts.length;
              const lost = sent - received;
              const min = collectedRtts.length > 0 ? Math.min(...collectedRtts) : 0;
              const max = collectedRtts.length > 0 ? Math.max(...collectedRtts) : 0;
              const avg =
                collectedRtts.length > 0
                  ? collectedRtts.reduce((a, b) => a + b, 0) / collectedRtts.length
                  : 0;

              setSummary({
                sent,
                received,
                lost,
                min,
                avg,
                max,
              });
            }
          } catch {
            // Ignore parse errors on partial chunks
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setErrorMessage(err.message || "Gagal menghubungkan ke service ping.");
        setTerminalLines((prev) => [...prev, `[ERROR] ${err.message}`]);
      }
    } finally {
      clearTimeout(timeoutId);
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsRunning(false);
      setTerminalLines((prev) => [...prev, "^C -- Probe dihentikan oleh user."]);
    }
  };

  const renderSparkline = () => {
    const validPackets = packets.filter((p) => p.rtt !== null);
    if (validPackets.length < 2) return null;

    const rtts = validPackets.map((p) => p.rtt as number);
    const min = Math.min(...rtts);
    const max = Math.max(...rtts);
    const range = max - min || 1;

    const width = 160;
    const height = 32;

    const points = rtts
      .map((val, idx) => {
        const x = (idx / (rtts.length - 1)) * (width - 10) + 5;
        const y = height - 5 - ((val - min) / range) * (height - 12);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    return (
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-muted">RTT Jitter:</span>
        <svg width={width} height={height} className="overflow-visible bg-surface/50 border border-border/40 rounded-xs p-1">
          <polyline
            fill="none"
            stroke="var(--color-signal)"
            strokeWidth="1.5"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {rtts.map((val, idx) => {
            const x = (idx / (rtts.length - 1)) * (width - 10) + 5;
            const y = height - 5 - ((val - min) / range) * (height - 12);
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="2"
                fill={val < 50 ? "var(--color-status-up)" : val <= 150 ? "var(--color-status-warn)" : "var(--color-status-critical)"}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Input Area */}
      <div className="border border-border bg-canvas rounded-md p-4 sm:p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleStartPing();
          }}
          className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
        >
          <div className="flex-1">
            <label htmlFor="ping-target" className="sr-only">
              Target Host / IPv4
            </label>
            <div className="relative">
              <input
                id="ping-target"
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="mis. 1.1.1.1, 8.8.8.8, atau idnic.net"
                disabled={isRunning}
                className="w-full h-10 px-3.5 bg-surface border border-border rounded-md font-mono text-sm text-ink focus:outline-hidden focus:border-signal focus:ring-1 focus:ring-signal transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button
                type="submit"
                disabled={!target.trim()}
                aria-label="Kirim 5 paket ICMP ping"
                className="h-10 px-5 gap-2 font-mono text-xs cursor-pointer"
              >
                <Play className="h-3.5 w-3.5" />
                Jalankan Ping
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                onClick={handleStop}
                aria-label="Hentikan pengujian ping"
                className="h-10 px-5 gap-2 font-mono text-xs cursor-pointer"
              >
                <Square className="h-3.5 w-3.5" />
                Hentikan
              </Button>
            )}
          </div>
        </form>

        {/* Quick presets & Disclaimer */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-muted">
            <span>Preset:</span>
            {["1.1.1.1", "8.8.8.8", "9.9.9.9", "idnic.net"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTarget(preset)}
                className="text-signal hover:underline px-1 py-0.5 rounded-xs hover:bg-surface transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-muted/80">
            5 ICMP Echo Requests (timeout 2s per probe)
          </span>
        </div>

        <p className="mt-3 pt-3 border-t border-border/60 text-[11px] text-muted font-sans leading-normal">
          Tools ini berjalan dari server portofolio. Hanya untuk tujuan diagnostik. Jangan gunakan untuk probe target tanpa izin.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-status-critical/40 bg-status-critical/10 p-3 font-mono text-xs text-status-critical flex items-center gap-2">
          <span>[!] {errorMessage}</span>
        </div>
      )}

      {/* Output Section */}
      {packets.length > 0 || isRunning || terminalLines.length > 0 ? (
        <div className="space-y-4">
          {/* Summary Panel */}
          {summary && (
            <div className="border border-border bg-surface p-4 rounded-md font-mono text-xs grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
              <div>
                <div className="text-muted text-[11px]">Transmitted / Received</div>
                <div className="text-ink font-semibold mt-0.5 text-sm">
                  {summary.sent} / {summary.received}{" "}
                  <span className={summary.lost > 0 ? "text-status-critical text-xs" : "text-status-up text-xs"}>
                    ({Math.round((summary.lost / summary.sent) * 100)}% loss)
                  </span>
                </div>
              </div>
              <div>
                <div className="text-muted text-[11px]">Min RTT</div>
                <div className="text-status-up font-semibold mt-0.5 text-sm">
                  {summary.min.toFixed(1)} ms
                </div>
              </div>
              <div>
                <div className="text-muted text-[11px]">Avg RTT</div>
                <div className="text-signal font-semibold mt-0.5 text-sm">
                  {summary.avg.toFixed(1)} ms
                </div>
              </div>
              <div>
                <div className="text-muted text-[11px]">Max RTT</div>
                <div className="text-status-warn font-semibold mt-0.5 text-sm">
                  {summary.max.toFixed(1)} ms
                </div>
              </div>
            </div>
          )}

          {/* Packet Table & Sparkline */}
          <div className="border border-border bg-canvas rounded-md overflow-hidden">
            <div className="px-4 py-2.5 bg-surface border-b border-border flex items-center justify-between">
              <span className="font-mono text-xs font-medium text-ink flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-signal" />
                ICMP Packet Live Stream
              </span>
              {renderSparkline()}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-surface/60 border-b border-border/40 text-muted">
                  <tr>
                    <th className="py-2 px-3 w-10">Status</th>
                    <th className="py-2 px-3 w-16">Seq</th>
                    <th className="py-2 px-3 w-20">Size</th>
                    <th className="py-2 px-3 w-20">TTL</th>
                    <th className="py-2 px-3">RTT</th>
                    <th className="py-2 px-3 text-right">Raw Output</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {packets.map((p) => {
                    const statusLevel = p.isTimeout
                      ? "critical"
                      : p.rtt !== null && p.rtt < 50
                      ? "good"
                      : p.rtt !== null && p.rtt <= 150
                      ? "warn"
                      : "critical";

                    return (
                      <tr key={p.seq} className="hover:bg-surface/40 transition-colors animate-in fade-in duration-200">
                        <td className="py-2 px-3">
                          <StatusDot status={statusLevel} />
                        </td>
                        <td className="py-2 px-3 font-semibold text-muted">#{p.seq}</td>
                        <td className="py-2 px-3 text-muted">{p.bytes} bytes</td>
                        <td className="py-2 px-3 text-muted">ttl={p.ttl}</td>
                        <td className="py-2 px-3 font-semibold">
                          {p.isTimeout ? (
                            <span className="text-status-critical">Timeout</span>
                          ) : (
                            <span
                              className={
                                p.rtt !== null && p.rtt < 50
                                  ? "text-status-up"
                                  : p.rtt !== null && p.rtt <= 150
                                  ? "text-status-warn"
                                  : "text-status-critical"
                              }
                            >
                              {p.rtt?.toFixed(1)} ms
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-muted/70 text-[11px] text-right font-mono truncate max-w-xs">
                          {p.raw}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Raw Terminal View */}
          <OutputTerminal
            title={`ping -n 5 ${target}`}
            isRunning={isRunning}
            onClear={() => setTerminalLines([])}
          >
            {terminalLines.map((line, idx) => (
              <div key={idx} className="leading-relaxed">
                {line}
              </div>
            ))}
          </OutputTerminal>
        </div>
      ) : (
        /* Empty State */
        <div className="border border-dashed border-border rounded-md p-8 sm:p-12 text-center bg-surface/30">
          <div className="font-mono text-sm text-ink font-medium mb-1">
            Siap untuk pengujian latensi ICMP
          </div>
          <p className="text-xs text-muted max-w-lg mx-auto font-mono leading-relaxed">
            Masukkan hostname FQDN atau alamat IPv4 publik di atas, lalu klik &quot;Jalankan Ping&quot;. Sistem akan mengirimkan 5 paket ICMP Echo Request dan menampilkan waktu round-trip (RTT) serta jitter secara real-time.
          </p>
        </div>
      )}
    </div>
  );
}
