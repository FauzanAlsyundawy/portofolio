import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// --- HEAD handler: dipakai oleh client untuk latency probe ---
// Mengembalikan 200 dengan minimal header tanpa body
export async function HEAD(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(`speedtest_${ip}`, 30, 60_000);

  if (!limit.allowed) {
    return new Response(null, { status: 429 });
  }

  return new Response(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    },
  });
}

// --- GET handler: streaming download dengan chunked generator ---
// Menggunakan ReadableStream generator untuk menghindari alokasi buffer besar in-memory
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  // Higher limit for speedtest iterations (30 requests/min)
  const limit = rateLimit(`speedtest_${ip}`, 30, 60_000);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit speedtest tercapai. Silakan coba sesaat lagi." },
      { status: 429 }
    );
  }

  const rawSize = parseInt(req.nextUrl.searchParams.get("size") ?? "5", 10);
  const sizeMB = Math.min(Math.max(isNaN(rawSize) ? 5 : rawSize, 1), 50); // cap 50MB

  const byteLength = sizeMB * 1024 * 1024;
  // Chunk size for streaming: 256KB per chunk
  // This avoids allocating the full buffer at once
  const CHUNK_SIZE = 256 * 1024;

  const stream = new ReadableStream({
    async start(controller) {
      let remaining = byteLength;
      while (remaining > 0) {
        const chunkBytes = Math.min(CHUNK_SIZE, remaining);
        const chunk = new Uint8Array(chunkBytes);

        // Fill chunk with random bytes (getRandomValues max 65536 per call)
        for (let offset = 0; offset < chunkBytes; offset += 65536) {
          const end = Math.min(offset + 65536, chunkBytes);
          crypto.getRandomValues(chunk.subarray(offset, end));
        }

        controller.enqueue(chunk);
        remaining -= chunkBytes;

        // Yield to event loop between chunks to avoid blocking
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }
      controller.close();
    },
    cancel() {
      // Client disconnected mid-download — stream will stop automatically
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(byteLength),
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// --- POST handler: upload receiver ---
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = rateLimit(`speedtest_up_${ip}`, 30, 60_000);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Rate limit upload speedtest tercapai." },
      { status: 429 }
    );
  }

  try {
    const buffer = await req.arrayBuffer();
    return NextResponse.json({
      received: true,
      bytes: buffer.byteLength,
      timestamp: Date.now(),
    });
  } catch {
    return NextResponse.json({ error: "Gagal memproses payload upload." }, { status: 500 });
  }
}
