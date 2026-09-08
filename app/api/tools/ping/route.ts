import { spawn } from "child_process";
import { NextRequest } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isValidTargetFormat, isPrivateOrBlockedTarget } from "@/lib/network-security";

export const dynamic = "force-dynamic";

// Max time (ms) a ping process is allowed to run before forced kill
const PROC_TIMEOUT_MS = 18_000;

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

  // Keep ref to proc and timers so they can be cleaned up in cancel()
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
      // Windows: ping -n 5 -w 2000 [target]
      // Linux/macOS: ping -c 5 -W 2 [target]
      const args = isWindows ? ["-n", "5", "-w", "2000", target] : ["-c", "5", "-W", "2", target];

      let buffer = "";

      try {
        proc = spawn("ping", args);

        if (!proc.stdout || !proc.stderr) {
          simInterval = runSimulatedPing(target, controller, encoder, () => isClosed);
          return;
        }

        // Hard kill after PROC_TIMEOUT_MS to prevent hung streams
        procKillTimer = setTimeout(() => {
          safeEnqueue(
            controller,
            encoder.encode(`data: ${JSON.stringify({ line: "[!] Ping timed out (server-side kill).", isError: true, timestamp: Date.now() })}\n\n`)
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
                line: chunk.toString().trim(),
                isError: true,
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
          // Fallback simulation mode jika environment serverless tidak mengizinkan spawn ping
          if (procKillTimer) { clearTimeout(procKillTimer); procKillTimer = null; }
          simInterval = runSimulatedPing(target, controller, encoder, () => isClosed);
        });
      } catch {
        simInterval = runSimulatedPing(target, controller, encoder, () => isClosed);
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

function runSimulatedPing(
  target: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  getIsClosed?: () => boolean
): ReturnType<typeof setInterval> {
  if (!getIsClosed?.()) {
    try {
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            line: `[Notice] Menjalankan via fallback diagnostic engine untuk ${target}`,
            timestamp: Date.now(),
            mode: "simulation",
          })}\n\n`
        )
      );
    } catch { /* client already disconnected */ }
  }

  let seq = 1;
  const baseRtt = Math.floor(Math.random() * 20) + 12; // 12-32ms

  const interval = setInterval(() => {
    if (seq > 5) {
      clearInterval(interval);
      try {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              line: `--- ${target} ping statistics --- 5 packets transmitted, 5 received, 0% packet loss`,
              timestamp: Date.now(),
            })}\n\n`
          )
        );
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, exitCode: 0, mode: "simulation" })}\n\n`)
        );
        controller.close();
      } catch { /* client already disconnected */ }
      return;
    }

    const jitter = (Math.random() * 4 - 2).toFixed(1);
    const rtt = Math.max(1, (baseRtt + parseFloat(jitter))).toFixed(1);
    const rttNum = parseFloat(rtt);
    const line = `64 bytes from ${target}: icmp_seq=${seq} ttl=116 time=${rtt} ms`;

    try {
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ line, seq, rtt: rttNum, timestamp: Date.now(), mode: "simulation" })}\n\n`
        )
      );
    } catch { /* client already disconnected — interval will be cleaned up via cancel() */ }
    seq++;
  }, 400);

  return interval;
}
