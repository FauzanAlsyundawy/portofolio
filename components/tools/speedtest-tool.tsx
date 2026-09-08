"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Gauge, Play, ArrowDown, ArrowUp, Zap, RotateCcw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type TestPhase = "idle" | "latency" | "download" | "upload" | "finished";

interface SpeedTestResult {
  id: string;
  timestamp: number;
  latency: number;
  download: number;
  upload: number;
}

export function SpeedTestTool() {
  const [phase, setPhase] = useState<TestPhase>("idle");
  const [latency, setLatency] = useState<number | null>(null);
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<SpeedTestResult[]>([]);
  const [statusText, setStatusText] = useState("Siap menjalankan pengujian throughput");

  const abortControllerRef = useRef<AbortController | null>(null);

  const runTest = async () => {
    if (phase !== "idle" && phase !== "finished") return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLatency(null);
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setProgress(0);

    try {
      // 1. LATENCY PHASE
      setPhase("latency");
      setStatusText("Mengukur socket round-trip time (RTT)...");

      const pings: number[] = [];
      for (let i = 0; i < 4; i++) {
        if (controller.signal.aborted) return;
        const start = performance.now();
        await fetch(`/api/tools/speedtest?size=1&t=${Date.now()}`, {
          method: "HEAD",
          cache: "no-store",
          signal: controller.signal,
        });
        const end = performance.now();
        pings.push(end - start);
        setProgress((i + 1) * 5); // 0 - 20%
        await new Promise((r) => setTimeout(r, 80));
      }

      const avgLatency = pings.reduce((a, b) => a + b, 0) / pings.length;
      setLatency(avgLatency);

      // 2. DOWNLOAD PHASE
      setPhase("download");
      setStatusText("Mentransfer paket payload data downlink non-compressible...");

      const downloadSizes = [2, 5]; // MB
      let totalBytesReceived = 0;
      let totalDurationSec = 0;

      for (let idx = 0; idx < downloadSizes.length; idx++) {
        if (controller.signal.aborted) return;
        const size = downloadSizes[idx];
        const dlStart = performance.now();

        const dlRes = await fetch(`/api/tools/speedtest?size=${size}&t=${Date.now()}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!dlRes.body) throw new Error("Stream downlink tidak tersedia.");

        const reader = dlRes.body.getReader();
        let currentReceived = 0;

        while (true) {
          if (controller.signal.aborted) return;
          const { done, value } = await reader.read();
          if (done) break;

          currentReceived += value.byteLength;
          const currentNow = performance.now();
          const elapsed = (currentNow - dlStart) / 1000;
          if (elapsed > 0.05) {
            const currentMbps = (currentReceived * 8) / elapsed / 1_000_000;
            setDownloadSpeed(currentMbps);
          }

          const basePercent = 20 + idx * 25;
          const innerPercent = Math.min(
            (currentReceived / (size * 1024 * 1024)) * 25,
            25
          );
          setProgress(Math.round(basePercent + innerPercent));
        }

        const dlEnd = performance.now();
        const duration = (dlEnd - dlStart) / 1000;
        totalBytesReceived += currentReceived;
        totalDurationSec += duration;
      }

      const finalDlMbps = (totalBytesReceived * 8) / totalDurationSec / 1_000_000;
      setDownloadSpeed(finalDlMbps);

      // 3. UPLOAD PHASE
      setPhase("upload");
      setStatusText("Mentransmisikan payload data uplink random stream...");

      const uploadSizeMB = 3;
      const uploadBytes = uploadSizeMB * 1024 * 1024;
      const uploadBuffer = new Uint8Array(uploadBytes);

      // Fill in safe chunks
      for (let offset = 0; offset < uploadBytes; offset += 65536) {
        const end = Math.min(offset + 65536, uploadBytes);
        crypto.getRandomValues(uploadBuffer.subarray(offset, end));
      }

      const upStart = performance.now();
      setProgress(75);

      await fetch("/api/tools/speedtest", {
        method: "POST",
        body: uploadBuffer,
        cache: "no-store",
        signal: controller.signal,
      });

      const upEnd = performance.now();
      const upDuration = (upEnd - upStart) / 1000;
      const finalUlMbps = (uploadBytes * 8) / upDuration / 1_000_000;

      setUploadSpeed(finalUlMbps);
      setProgress(100);

      // 4. FINISHED
      setPhase("finished");
      setStatusText("Pengujian throughput selesai dengan sukses.");

      const newRecord: SpeedTestResult = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        latency: avgLatency,
        download: finalDlMbps,
        upload: finalUlMbps,
      };

      setHistory((prev) => [newRecord, ...prev.slice(0, 4)]);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setStatusText(`Gagal: ${err.message || "Koneksi terputus."}`);
      } else {
        setStatusText("Pengujian dihentikan.");
      }
      setPhase("finished");
    } finally {
      abortControllerRef.current = null;
    }
  };

  const cancelTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setPhase("finished");
      setStatusText("Pengujian dibatalkan oleh pengguna.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="border border-border bg-canvas rounded-md p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-mono text-sm font-semibold text-ink flex items-center gap-2">
              <Gauge className="h-4 w-4 text-signal" />
              Direct Socket End-to-End Throughput Test
            </div>
            <p className="text-xs text-muted font-mono mt-1">
              Mengukur kapasitas bandwidth dua arah (Downlink & Uplink) langsung dari browser Anda ke server portofolio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {phase === "idle" || phase === "finished" ? (
              <Button
                type="button"
                onClick={runTest}
                aria-label="Mulai speed test throughput"
                className="h-10 px-6 gap-2 font-mono text-xs cursor-pointer"
              >
                <Play className="h-3.5 w-3.5" />
                Mulai Speed Test
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                onClick={cancelTest}
                aria-label="Batalkan speed test"
                className="h-10 px-5 gap-2 font-mono text-xs cursor-pointer"
              >
                Batalkan
              </Button>
            )}
          </div>
        </div>

        {/* Phase Progress Bar */}
        {(phase !== "idle" || progress > 0) && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-ink font-medium flex items-center gap-1.5">
                {phase === "finished" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-status-up" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-signal animate-ping" />
                )}
                {statusText}
              </span>
              <span className="text-muted font-semibold">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-surface border border-border rounded-full overflow-hidden">
              <div
                className="h-full bg-signal transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <p className="mt-4 pt-3 border-t border-border/60 text-[11px] text-muted font-sans leading-normal">
          Hasil diukur antara browser Anda dan server hosting portofolio ini. Bukan hasil benchmark ke server ISP terdekat.
        </p>
      </div>

      {/* Metrics Cards — Big Monospace Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Latency */}
        <div
          className={cn(
            "border border-border bg-canvas rounded-md p-5 font-mono transition-all",
            phase === "latency" && "border-signal shadow-xs bg-surface/40"
          )}
        >
          <div className="flex items-center justify-between text-muted text-xs mb-2">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-signal" />
              LATENCY / RTT
            </span>
            {phase === "latency" && (
              <span className="text-[10px] text-signal font-semibold animate-pulse">TESTING...</span>
            )}
          </div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            {latency !== null ? latency.toFixed(1) : "—"}
            <span className="text-sm font-medium text-muted ml-1.5">ms</span>
          </div>
          <div className="text-[11px] text-muted mt-2">
            {latency !== null
              ? latency < 50
                ? "Optimal (Low Latency)"
                : latency <= 150
                ? "Moderate Transit"
                : "High Latency"
              : "Socket round-trip probe"}
          </div>
        </div>

        {/* Download Speed */}
        <div
          className={cn(
            "border border-border bg-canvas rounded-md p-5 font-mono transition-all",
            phase === "download" && "border-signal shadow-xs bg-surface/40"
          )}
        >
          <div className="flex items-center justify-between text-muted text-xs mb-2">
            <span className="flex items-center gap-1.5">
              <ArrowDown className="h-3.5 w-3.5 text-status-up" />
              DOWNLOAD THROUGHPUT
            </span>
            {phase === "download" && (
              <span className="text-[10px] text-signal font-semibold animate-pulse">STREAMING...</span>
            )}
          </div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            {downloadSpeed !== null ? downloadSpeed.toFixed(1) : "—"}
            <span className="text-sm font-medium text-muted ml-1.5">Mbps</span>
          </div>
          <div className="text-[11px] text-muted mt-2">
            {downloadSpeed !== null
              ? `${(downloadSpeed / 8).toFixed(2)} MB/s transfer rate`
              : "Chunked streaming reader"}
          </div>
        </div>

        {/* Upload Speed */}
        <div
          className={cn(
            "border border-border bg-canvas rounded-md p-5 font-mono transition-all",
            phase === "upload" && "border-signal shadow-xs bg-surface/40"
          )}
        >
          <div className="flex items-center justify-between text-muted text-xs mb-2">
            <span className="flex items-center gap-1.5">
              <ArrowUp className="h-3.5 w-3.5 text-signal" />
              UPLOAD THROUGHPUT
            </span>
            {phase === "upload" && (
              <span className="text-[10px] text-signal font-semibold animate-pulse">UPLOADING...</span>
            )}
          </div>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            {uploadSpeed !== null ? uploadSpeed.toFixed(1) : "—"}
            <span className="text-sm font-medium text-muted ml-1.5">Mbps</span>
          </div>
          <div className="text-[11px] text-muted mt-2">
            {uploadSpeed !== null
              ? `${(uploadSpeed / 8).toFixed(2)} MB/s upstream rate`
              : "Binary random payload"}
          </div>
        </div>
      </div>

      {/* Session Test History (Mini Graph / Table) */}
      {history.length > 0 && (
        <div className="border border-border bg-canvas rounded-md overflow-hidden font-mono text-xs">
          <div className="px-4 py-2.5 bg-surface border-b border-border flex items-center justify-between">
            <span className="font-medium text-ink flex items-center gap-2">
              <RotateCcw className="h-3.5 w-3.5 text-signal" />
              Session Test History ({history.length} pengujian)
            </span>
            <button
              onClick={() => setHistory([])}
              className="text-muted hover:text-ink text-[11px] cursor-pointer"
            >
              Hapus Riwayat
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono">
              <thead className="bg-surface/60 border-b border-border text-muted">
                <tr>
                  <th className="py-2 px-3">Waktu</th>
                  <th className="py-2 px-3">Latency</th>
                  <th className="py-2 px-3">Download</th>
                  <th className="py-2 px-3">Upload</th>
                  <th className="py-2 px-3 text-right">Throughput Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-surface/40 transition-colors">
                    <td className="py-2 px-3 text-muted">
                      {new Date(record.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-2 px-3 text-ink font-semibold">
                      {record.latency.toFixed(1)} ms
                    </td>
                    <td className="py-2 px-3 text-status-up font-semibold">
                      {record.download.toFixed(1)} Mbps
                    </td>
                    <td className="py-2 px-3 text-signal font-semibold">
                      {record.upload.toFixed(1)} Mbps
                    </td>
                    <td className="py-2 px-3 text-right text-muted">
                      {record.upload > 0
                        ? `1:${(record.download / record.upload).toFixed(1)} DL:UL`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
