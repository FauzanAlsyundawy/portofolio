"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { PingTool } from "./ping-tool";
import { TracerouteTool } from "./traceroute-tool";
import { WhoisTool } from "./whois-tool";
import { SpeedTestTool } from "./speedtest-tool";
import { Activity, Route, Search, Gauge, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOLS = [
  { id: "ping", label: "Ping", icon: Activity, description: "ICMP Echo Request round-trip time & packet loss" },
  { id: "traceroute", label: "Traceroute", icon: Route, description: "Layer 3 hop-by-hop transit & ASN peering path" },
  { id: "whois", label: "WHOIS / RDAP", icon: Search, description: "RESTful RDAP registry lookup untuk IP, CIDR, & Domain" },
  { id: "speedtest", label: "Speed Test", icon: Gauge, description: "Direct socket downlink & uplink throughput benchmark" },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

export function ToolsShell() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeToolParam = searchParams.get("tool")?.toLowerCase();
  const activeTool: ToolId =
    TOOLS.some((t) => t.id === activeToolParam) ? (activeToolParam as ToolId) : "ping";

  const handleSelectTool = (id: ToolId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tool", id);
    router.replace(`/tools?${params.toString()}`, { scroll: false });
  };

  const currentToolConfig = TOOLS.find((t) => t.id === activeTool) || TOOLS[0];

  return (
    <div className="container-section py-10 lg:py-16 space-y-8">
      {/* Top Header */}
      <div className="border-b border-border/80 pb-6">
        <div className="flex items-center gap-2 font-mono text-xs text-signal font-semibold tracking-wider uppercase mb-2">
          <Terminal className="h-4 w-4" />
          <span>NOC & Engineering Diagnostic Console</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-sans">
          Network Diagnostic Tools
        </h1>
        <p className="mt-2 text-sm text-muted max-w-3xl leading-relaxed">
          Rangkaian utilitas diagnostik jaringan server-side dan client-side untuk pengujian latensi ICMP, penelusuran jalur transit BGP/OSPF hop layer 3, inspeksi registrasi RDAP, dan benchmark throughput data.
        </p>
      </div>

      {/* Tabs Navigation — Underline Indicator in Signal Cyan */}
      <div className="border-b border-border">
        <nav className="flex space-x-6 sm:space-x-8 overflow-x-auto" aria-label="Tools Navigation">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => handleSelectTool(tool.id)}
                className={cn(
                  "group inline-flex items-center gap-2 py-3.5 px-1 border-b-2 font-mono text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer",
                  isActive
                    ? "border-signal text-ink font-semibold"
                    : "border-transparent text-muted hover:text-ink hover:border-border"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-signal" : "text-muted group-hover:text-ink"
                  )}
                />
                {tool.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Current Tool Header Description */}
      <div className="flex items-center justify-between text-xs font-mono text-muted bg-surface/60 border border-border/60 px-4 py-2 rounded-md">
        <span>Fokus: {currentToolConfig.description}</span>
        <span className="hidden sm:inline-block text-[11px] text-muted/70">
          Tab aktif: ?tool={activeTool}
        </span>
      </div>

      {/* Active Tool Area */}
      <div className="mt-6">
        {activeTool === "ping" && <PingTool />}
        {activeTool === "traceroute" && <TracerouteTool />}
        {activeTool === "whois" && <WhoisTool />}
        {activeTool === "speedtest" && <SpeedTestTool />}
      </div>
    </div>
  );
}
