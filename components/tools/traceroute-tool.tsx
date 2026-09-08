"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { HopRow, HopData } from "./hop-row";
import { OutputTerminal } from "./output-terminal";
import { Play, Square, Route, Layers } from "lucide-react";

export function TracerouteTool() {
  const [target, setTarget] = useState("1.1.1.1");
  const [maxHops, setMaxHops] = useState(15);
  const [isRunning, setIsRunning] = useState(false);
  const [hops, setHops] = useState<HopData[]>([]);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRawTerminal, setShowRawTerminal] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const asnCacheRef = useRef<Map<string, { asn: string; org: string }>>(new Map());

  // Client-side ASN lookup helper — routes through server proxy to protect privacy
  // (Hop IPs are NOT sent directly to third-party ip-api.com from the browser)
  const lookupAsn = async (ip: string) => {
    if (!ip || ip === "*" || ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.")) {
      return null;
    }
    if (asnCacheRef.current.has(ip)) {
      return asnCacheRef.current.get(ip);
    }
    try {
      const res = await fetch(`/api/tools/asn?ip=${encodeURIComponent(ip)}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.asn) {
        const result = { asn: data.asn as string, org: data.org as string };
        asnCacheRef.current.set(ip, result);
        return result;
      }
    } catch {}
    return null;
  };


  const handleStartTrace = async () => {
    if (!target.trim() || isRunning) return;

    setErrorMessage(null);
    setHops([]);
    setTerminalLines([]);
    setIsRunning(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(
        `/api/tools/traceroute?target=${encodeURIComponent(target.trim())}&maxhops=${maxHops}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${response.status}`);
      }

      if (!response.body) throw new Error("ReadableStream not supported by browser.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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

              // Check if server sent pre-parsed hop
              if (data.parsedHop) {
                const pHop: HopData = {
                  hop: data.parsedHop.hop,
                  ip: data.parsedHop.ip,
                  host: data.parsedHop.host,
                  rtt1: data.parsedHop.rtt1,
                  rtt2: data.parsedHop.rtt2,
                  rtt3: data.parsedHop.rtt3,
                };

                setHops((prev) => [...prev, pHop]);

                // Asynchronously enrich with ASN
                lookupAsn(pHop.ip).then((asnInfo) => {
                  if (asnInfo) {
                    setHops((currentHops) =>
                      currentHops.map((h) =>
                        h.hop === pHop.hop ? { ...h, asn: asnInfo.asn, org: asnInfo.org } : h
                      )
                    );
                  }
                });
                continue;
              }

              // Otherwise parse line from Windows / Linux traceroute
              // Windows format:
              //   1    <1 ms    <1 ms    <1 ms  192.168.1.1
              //   2    12 ms    13 ms    11 ms  edge.isp.net [203.0.113.1]
              //   3     *        *        *     Request timed out.
              // Linux format:
              //   1  192.168.1.1 (192.168.1.1)  1.234 ms  1.123 ms  1.456 ms
              const rawLine = String(data.line).trim();
              const hopMatch = rawLine.match(/^\s*(\d+)\s+/);

              if (hopMatch) {
                const hopNum = parseInt(hopMatch[1], 10);

                // Extract RTTs
                const rttMatches = Array.from(rawLine.matchAll(/(?:<(\d+)|(\d+(?:\.\d+)?))\s?ms|\*/g));
                const rtts: (number | null)[] = rttMatches.slice(0, 3).map((m) => {
                  if (m[0].includes("*")) return null;
                  return parseFloat(m[1] || m[2] || "0");
                });

                while (rtts.length < 3) rtts.push(null);

                // Extract IP and host
                let ip = "*";
                let host = "";

                const ipBrackets = rawLine.match(/\[([0-9a-fA-F.:]+)\]/);
                const ipParen = rawLine.match(/\(([0-9a-fA-F.:]+)\)/);
                const ipStandalone = rawLine.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);

                if (ipBrackets) {
                  ip = ipBrackets[1];
                  const hostPart = rawLine.split(ipBrackets[0])[0].split(/\s{2,}/).pop()?.trim();
                  host = hostPart || ip;
                } else if (ipParen) {
                  ip = ipParen[1];
                  const hostPart = rawLine.split(`(${ip})`)[0].trim().split(/\s+/).pop();
                  host = hostPart && hostPart !== ip ? hostPart : ip;
                } else if (ipStandalone) {
                  ip = ipStandalone[0];
                  host = ip;
                } else if (rawLine.includes("timed out") || rawLine.includes("*")) {
                  ip = "*";
                  host = "Request timed out";
                }

                const newHop: HopData = {
                  hop: hopNum,
                  ip,
                  host,
                  rtt1: rtts[0] ?? null,
                  rtt2: rtts[1] ?? null,
                  rtt3: rtts[2] ?? null,
                };

                setHops((prev) => {
                  const filtered = prev.filter((h) => h.hop !== hopNum);
                  return [...filtered, newHop].sort((a, b) => a.hop - b.hop);
                });

                if (ip !== "*") {
                  lookupAsn(ip).then((asnInfo) => {
                    if (asnInfo) {
                      setHops((currentHops) =>
                        currentHops.map((h) =>
                          h.hop === hopNum ? { ...h, asn: asnInfo.asn, org: asnInfo.org } : h
                        )
                      );
                    }
                  });
                }
              }
            }

            if (data.done) {
              setIsRunning(false);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setErrorMessage(err.message || "Gagal menjalankan traceroute.");
        setTerminalLines((prev) => [...prev, `[ERROR] ${err.message}`]);
      }
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsRunning(false);
      setTerminalLines((prev) => [...prev, "^C -- Traceroute dihentikan oleh user."]);
    }
  };

  // Find highest RTT for scale
  const maxRtt = Math.max(
    ...hops.flatMap((h) => [h.rtt1, h.rtt2, h.rtt3]).filter((v): v is number => v !== null && !isNaN(v)),
    20
  );

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="border border-border bg-canvas rounded-md p-4 sm:p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleStartTrace();
          }}
          className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
        >
          <div className="flex-1">
            <label htmlFor="trace-target" className="sr-only">
              Target Host / IPv4
            </label>
            <input
              id="trace-target"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="mis. 1.1.1.1, google.com, atau idnic.net"
              disabled={isRunning}
              className="w-full h-10 px-3.5 bg-surface border border-border rounded-md font-mono text-sm text-ink focus:outline-hidden focus:border-signal focus:ring-1 focus:ring-signal transition-colors disabled:opacity-50"
            />
          </div>

          <div className="w-32">
            <label htmlFor="max-hops" className="sr-only">
              Max Hops
            </label>
            <select
              id="max-hops"
              value={maxHops}
              onChange={(e) => setMaxHops(parseInt(e.target.value, 10))}
              disabled={isRunning}
              className="w-full h-10 px-2.5 bg-surface border border-border rounded-md font-mono text-xs text-ink focus:outline-hidden focus:border-signal cursor-pointer"
            >
              <option value="10">Max 10 hops</option>
              <option value="15">Max 15 hops</option>
              <option value="20">Max 20 hops</option>
              <option value="30">Max 30 hops</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button
                type="submit"
                disabled={!target.trim()}
                aria-label="Jalankan traceroute"
                className="h-10 px-5 gap-2 font-mono text-xs cursor-pointer"
              >
                <Play className="h-3.5 w-3.5" />
                Trace Route
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                onClick={handleStop}
                aria-label="Hentikan traceroute"
                className="h-10 px-5 gap-2 font-mono text-xs cursor-pointer"
              >
                <Square className="h-3.5 w-3.5" />
                Hentikan
              </Button>
            )}
          </div>
        </form>

        {/* Presets & Disclaimer */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-muted">
            <span>Preset:</span>
            {["1.1.1.1", "8.8.8.8", "idnic.net", "cloudflare.com"].map((preset) => (
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
            3 probes per hop, ASN BGP resolution aktif
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
      {hops.length > 0 || isRunning || terminalLines.length > 0 ? (
        <div className="space-y-4">
          {/* Hop Table */}
          <div className="border border-border bg-canvas rounded-md overflow-hidden">
            <div className="px-4 py-2.5 bg-surface border-b border-border flex items-center justify-between">
              <span className="font-mono text-xs font-medium text-ink flex items-center gap-2">
                <Route className="h-3.5 w-3.5 text-signal" />
                Hop Transit Matrix ({hops.length} hops detected)
              </span>

              <button
                type="button"
                onClick={() => setShowRawTerminal((v) => !v)}
                className="font-mono text-xs text-muted hover:text-ink transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Layers className="h-3.5 w-3.5" />
                {showRawTerminal ? "Sembunyikan Terminal" : "Tampilkan Terminal Raw"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-surface/70 border-b border-border text-muted">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-right">Hop</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3">Hostname (PTR)</th>
                    <th className="py-2.5 px-3">AS & Org</th>
                    <th className="py-2.5 px-2 text-right">RTT 1</th>
                    <th className="py-2.5 px-2 text-right">RTT 2</th>
                    <th className="py-2.5 px-2 text-right">RTT 3</th>
                    <th className="py-2.5 px-3 text-right">Latency Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {hops.map((hop) => (
                    <HopRow key={hop.hop} hop={hop} maxRtt={maxRtt} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Optional Raw Terminal View */}
          {showRawTerminal && (
            <OutputTerminal
              title={`tracert -h ${maxHops} ${target}`}
              isRunning={isRunning}
              onClear={() => setTerminalLines([])}
            >
              {terminalLines.map((line, idx) => (
                <div key={idx} className="leading-relaxed">
                  {line}
                </div>
              ))}
            </OutputTerminal>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="border border-dashed border-border rounded-md p-8 sm:p-12 text-center bg-surface/30">
          <div className="font-mono text-sm text-ink font-medium mb-1">
            Siap untuk tracing routing path Layer 3
          </div>
          <p className="text-xs text-muted max-w-lg mx-auto font-mono leading-relaxed">
            Traceroute memetakan setiap hop router sepanjang jalur transmisi paket dari server ke target host. Masukkan target IP atau hostname di atas untuk memulai analisis hop, reverse DNS, dan ASN peering.
          </p>
        </div>
      )}
    </div>
  );
}
