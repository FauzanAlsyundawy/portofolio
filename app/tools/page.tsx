import { Suspense } from "react";
import { Metadata } from "next";
import { ToolsShell } from "@/components/tools/tools-shell";

export const metadata: Metadata = {
  title: "Network Diagnostic Tools — Ping, Traceroute, WHOIS, Speed Test",
  description:
    "Enterprise network diagnostic console: ICMP ping latency streaming, hop-by-hop traceroute with ASN resolution, RDAP WHOIS registry lookup, and socket throughput benchmark.",
  openGraph: {
    title: "Network Diagnostic Tools | NOC Engineering Panel",
    description: "Traceroute, WHOIS, Ping, and Speed Test live network utilities.",
  },
};

export default function ToolsPage() {
  return (
    <div className="pt-16 min-h-screen bg-canvas">
      <Suspense
        fallback={
          <div className="container-section py-20 text-center font-mono text-sm text-muted">
            <span className="inline-block animate-pulse">Memuat Diagnostic Console...</span>
          </div>
        }
      >
        <ToolsShell />
      </Suspense>
    </div>
  );
}
