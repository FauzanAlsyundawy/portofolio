"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Globe, Network, Copy, Check, Code, ShieldCheck } from "lucide-react";

interface WhoisResult {
  type: "ip" | "domain";
  source: string;
  structured: Record<string, string>;
  raw: any;
}

export function WhoisTool() {
  const [query, setQuery] = useState("1.1.1.1");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WhoisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewRaw, setViewRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLookup = async () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/tools/whois?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Gagal melakukan lookup WHOIS/RDAP.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = viewRaw
      ? JSON.stringify(result.raw, null, 2)
      : Object.entries(result.structured)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n");

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="border border-border bg-canvas rounded-md p-4 sm:p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup();
          }}
          className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
        >
          <div className="flex-1">
            <label htmlFor="whois-query" className="sr-only">
              IPv4, CIDR, atau Domain
            </label>
            <input
              id="whois-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="mis. 1.1.1.1, 203.0.113.0/24, atau idnic.net"
              disabled={loading}
              className="w-full h-10 px-3.5 bg-surface border border-border rounded-md font-mono text-sm text-ink focus:outline-hidden focus:border-signal focus:ring-1 focus:ring-signal transition-colors disabled:opacity-50"
            />
          </div>

          <Button
            type="submit"
            disabled={!query.trim() || loading}
            aria-label="Jalankan WHOIS RDAP query"
            className="h-10 px-5 gap-2 font-mono text-xs cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" />
            {loading ? "Querying RDAP..." : "Query WHOIS / RDAP"}
          </Button>
        </form>

        {/* Quick presets & info */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-muted">
            <span>Preset:</span>
            {["1.1.1.1", "8.8.8.8", "idnic.net", "apnic.net"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setQuery(preset)}
                className="text-signal hover:underline px-1 py-0.5 rounded-xs hover:bg-surface transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-muted/80">
            Standard RFC 7480-7484 RESTful RDAP
          </span>
        </div>

        <p className="mt-3 pt-3 border-t border-border/60 text-[11px] text-muted font-sans leading-normal">
          Tools ini berjalan dari server portofolio. Hanya untuk tujuan diagnostik. Jangan gunakan untuk probe target tanpa izin.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-status-critical/40 bg-status-critical/10 p-3 font-mono text-xs text-status-critical flex items-center gap-2">
          <span>[!] {error}</span>
        </div>
      )}

      {/* Result View */}
      {result ? (
        <div className="space-y-4">
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-surface border border-border rounded-md font-mono text-xs">
            <div className="flex items-center gap-2">
              {result.type === "ip" ? (
                <Network className="h-4 w-4 text-signal" />
              ) : (
                <Globe className="h-4 w-4 text-signal" />
              )}
              <span className="font-semibold text-ink">{query}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-signal/10 text-signal border border-signal/20">
                Source: {result.source}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-7 text-xs gap-1 font-mono cursor-pointer"
              >
                {copied ? <Check className="h-3 w-3 text-status-up" /> : <Copy className="h-3 w-3" />}
                {copied ? "Tersalin" : "Salin Data"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewRaw((v) => !v)}
                className="h-7 text-xs gap-1 font-mono cursor-pointer"
              >
                <Code className="h-3 w-3" />
                {viewRaw ? "Tampilan Terstruktur" : "Raw JSON"}
              </Button>
            </div>
          </div>

          {/* Structured View */}
          {!viewRaw ? (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Group 1: Registration / Network Info */}
              <div className="border border-border bg-canvas rounded-md overflow-hidden font-mono text-xs">
                <div className="px-3.5 py-2 bg-surface/80 border-b border-border font-semibold text-ink flex items-center justify-between">
                  <span>{result.type === "ip" ? "NETWORK INFO" : "DOMAIN INFO"}</span>
                  <ShieldCheck className="h-3.5 w-3.5 text-signal" />
                </div>
                <div className="p-3.5 space-y-2.5 divide-y divide-border/30">
                  {Object.entries(result.structured)
                    .slice(0, 5)
                    .map(([key, val]) => (
                      <div key={key} className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-muted text-[11px] capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                        <span className="text-ink font-medium text-right break-all">{val || "—"}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Group 2: Organization & Timestamps */}
              <div className="border border-border bg-canvas rounded-md overflow-hidden font-mono text-xs">
                <div className="px-3.5 py-2 bg-surface/80 border-b border-border font-semibold text-ink flex items-center justify-between">
                  <span>REGISTRATION & CONTACTS</span>
                  <Globe className="h-3.5 w-3.5 text-signal" />
                </div>
                <div className="p-3.5 space-y-2.5 divide-y divide-border/30">
                  {Object.entries(result.structured)
                    .slice(5)
                    .map(([key, val]) => (
                      <div key={key} className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-muted text-[11px] capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                        <span className="text-ink font-medium text-right break-all">{val || "—"}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            /* Raw JSON View */
            <div className="rounded-md border border-[#1E293B] bg-[#0F172A] p-4 font-mono text-xs text-[#E2E8F0] overflow-x-auto max-h-[480px]">
              <pre className="whitespace-pre">{JSON.stringify(result.raw, null, 2)}</pre>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="border border-dashed border-border rounded-md p-8 sm:p-12 text-center bg-surface/30">
          <div className="font-mono text-sm text-ink font-medium mb-1">
            Siap untuk registrasi RDAP (WHOIS generasi baru)
          </div>
          <p className="text-xs text-muted max-w-lg mx-auto font-mono leading-relaxed">
            Query database Regional Internet Registry (ARIN, RIPE NCC, APNIC) atau otoritas TLD domain via protokol RDAP (RFC 7480-7484). Masukkan IPv4, subnet CIDR, atau nama domain di atas untuk menginspeksi alokasi network, ASN registrant, dan riwayat delegasi.
          </p>
        </div>
      )}
    </div>
  );
}
