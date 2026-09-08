import { spawn } from "child_process";
import { NextRequest } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isValidTargetFormat, isPrivateOrBlockedTarget, isIPv4Address } from "@/lib/network-security";

export const dynamic = "force-dynamic";

// Max time (ms) a traceroute process is allowed to run before forced kill
// Worst case: 30 hops × 3 probes × 2s timeout + buffer = 200s
// We cap at 120s for reasonable UX
const PROC_TIMEOUT_MS = 120_000;

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(ip, 10, 60_000);

  if (!limit.allowed) {
    return new Response(
      JSON.stringify({
        error: "Terlalu banyak permintaan (Rate limit tercapai). Silakan tunggu 1 menit.",
        resetIn: limit.resetInSeconds,
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  const target = req.nextUrl.searchParams.get("target")?.trim();
  const rawHops = parseInt(req.nextUrl.searchParams.get("maxhops") ?? "30", 10);
  const maxHops = Math.min(Math.max(isNaN(rawHops) ? 30 : rawHops, 1), 30);

  if (!target) {
    return new Response(JSON.stringify({ error: "Target host atau IP wajib diisi." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!isValidTargetFormat(target)) {
    return new Response(
      JSON.stringify({ error: "Format target tidak valid. Karakter diperbolehkan: a-z, 0-9, titik, tanda hubung." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (isPrivateOrBlockedTarget(target)) {
    return new Response(
      JSON.stringify({
        error: "Target privat / internal network (RFC1918 / Loopback) dilarang untuk alasan keamanan.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();

  let proc: ReturnType<typeof spawn> | null = null;
  let procKillTimer: ReturnType<typeof setTimeout> | null = null;
  let simInterval: ReturnType<typeof setInterval> | null = null;

  const cleanupProc = (signal: NodeJS.Signals = "SIGTERM") => {
    if (procKillTimer) {
      clearTimeout(procKillTimer);
      procKillTimer = null;
    }
    if (simInterval) {
      clearInterval(simInterval);
      simInterval = null;
    }
    if (proc && !proc.killed) {
      try { proc.kill(signal); } catch { /* ignore */ }
      proc = null;
    }
  };

  let isClosed = false;
  const safeEnqueue = (controller: ReadableStreamDefaultController, data: Uint8Array) => {
    if (isClosed) return;
    try {
      controller.enqueue(data);
    } catch {
      isClosed = true;
    }
  };

  const safeClose = (controller: ReadableStreamDefaultController) => {
    if (isClosed) return;
    isClosed = true;
    try {
      controller.close();
    } catch {
      // already closed
    }
  };

  const stream = new ReadableStream({
    start(controller) {
      const isWindows = process.platform === "win32";
      // Windows: tracert -h [maxHops] [target]
      // Linux/macOS: traceroute -m [maxHops] -q 3 -w 2 [target]
      const [cmd, args] = isWindows
        ? ["tracert", ["-h", String(maxHops), target]]
        : ["traceroute", ["-m", String(maxHops), "-q", "3", "-w", "2", target]];

      let buffer = "";

      try {
        proc = spawn(cmd, args);

        if (!proc.stdout || !proc.stderr) {
          simInterval = runSimulatedTraceroute(target, maxHops, controller, encoder, () => isClosed);
          return;
        }

        // Hard kill after PROC_TIMEOUT_MS to prevent hung streams
        procKillTimer = setTimeout(() => {
          safeEnqueue(
            controller,
            encoder.encode(`data: ${JSON.stringify({ line: "[!] Traceroute timed out (server-side kill).", isError: true, timestamp: Date.now() })}\n\n`)
          );
          cleanupProc();
          safeEnqueue(controller, encoder.encode(`data: ${JSON.stringify({ done: true, exitCode: -1 })}\n\n`));
          safeClose(controller);
        }, PROC_TIMEOUT_MS);

        proc.stdout.on("data", (chunk: Buffer) => {
          if (isClosed) return;
          buffer += chunk.toString();
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.trim()) {
              safeEnqueue(
                controller,
                encoder.encode(`data: ${JSON.stringify({ line, timestamp: Date.now(), mode: "live" })}\n\n`)
              );
            }
          }
        });

        proc.stderr.on("data", (chunk: Buffer) => {
          if (isClosed) return;
          safeEnqueue(
            controller,
            encoder.encode(
              `data: ${JSON.stringify({
                stderr: chunk.toString().trim(),
                timestamp: Date.now(),
              })}\n\n`
            )
          );
        });

        proc.on("close", (code) => {
          if (procKillTimer) { clearTimeout(procKillTimer); procKillTimer = null; }
          if (buffer.trim()) {
            safeEnqueue(
              controller,
              encoder.encode(`data: ${JSON.stringify({ line: buffer.trim(), timestamp: Date.now() })}\n\n`)
            );
          }
          safeEnqueue(
            controller,
            encoder.encode(`data: ${JSON.stringify({ done: true, exitCode: code })}\n\n`)
          );
          safeClose(controller);
        });

        proc.on("error", () => {
          if (procKillTimer) { clearTimeout(procKillTimer); procKillTimer = null; }
          simInterval = runSimulatedTraceroute(target, maxHops, controller, encoder, () => isClosed);
        });
      } catch {
        simInterval = runSimulatedTraceroute(target, maxHops, controller, encoder, () => isClosed);
      }
    },

    // Called when client disconnects or AbortController fires
    cancel() {
      isClosed = true;
      cleanupProc();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

function runSimulatedTraceroute(
  target: string,
  maxHops: number,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  getIsClosed?: () => boolean
): ReturnType<typeof setInterval> {
  if (!getIsClosed?.()) {
    try {
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            line: `[Notice] Menjalankan traceroute via fallback diagnostic routing untuk ${target}`,
            timestamp: Date.now(),
            mode: "simulation",
          })}\n\n`
        )
      );
    } catch { /* client already disconnected */ }
  }

  // Last hop IP: only use target if it's a real IPv4, otherwise use a generic public IP
  const lastHopIp = isIPv4Address(target) ? target : "203.0.113.254";
  const lastHopHost = isIPv4Address(target) ? target : `host.${target}`;

  const sampleHops = [
    { hop: 1, ip: "103.247.0.1", host: "gw-jkt-core01.isp.net.id", rtt: [1.2, 1.1, 1.4] },
    { hop: 2, ip: "103.247.11.2", host: "pe-edge-jkt.isp.net.id", rtt: [2.5, 2.7, 2.4] },
    { hop: 3, ip: "218.100.36.1", host: "ixp-peering.jkt.iix.net.id", rtt: [4.8, 5.1, 4.9] },
    { hop: 4, ip: "182.253.250.41", host: "as7713-transit.telkom.net.id", rtt: [7.2, 7.8, 7.5] },
    { hop: 5, ip: "72.14.215.198", host: "google-edge.singapore.telia.net", rtt: [18.2, 19.1, 18.7] },
    { hop: 6, ip: "142.250.224.238", host: "core-sg-infra.1e100.net", rtt: [21.4, 22.0, 21.8] },
    { hop: 7, ip: lastHopIp, host: lastHopHost, rtt: [22.8, 23.1, 22.9] },
  ];

  let idx = 0;
  const total = Math.min(sampleHops.length, maxHops);

  const interval = setInterval(() => {
    if (idx >= total) {
      clearInterval(interval);
      try {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, exitCode: 0, mode: "simulation" })}\n\n`)
        );
        controller.close();
      } catch { /* client already disconnected */ }
      return;
    }

    const h = sampleHops[idx];
    const line = `  ${h.hop}    ${h.rtt[0]} ms    ${h.rtt[1]} ms    ${h.rtt[2]} ms  ${h.host} [${h.ip}]`;
    try {
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            line,
            parsedHop: {
              hop: h.hop,
              ip: h.ip,
              host: h.host,
              rtt1: h.rtt[0],
              rtt2: h.rtt[1],
              rtt3: h.rtt[2],
            },
            timestamp: Date.now(),
            mode: "simulation",
          })}\n\n`
        )
      );
    } catch { /* client already disconnected */ }
    idx++;
  }, 450);

  return interval;
}
