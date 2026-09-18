"use client";

import { Card } from "@/components/ui/card";
import { SubnetCalculator } from "@/components/interactive/subnet-calculator";
import { Calculator } from "lucide-react";

export function LabShowcase() {
  return (
    <section id="ip-calculator" className="py-20 bg-canvas relative">
      {/* Anchor fallback for lab link */}
      <div id="lab" className="sr-only" aria-hidden="true" />
      <div className="container-section">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal/5 px-3 py-1 text-xs font-medium text-signal mb-3">
            <Calculator className="h-3.5 w-3.5" />
            <span>Interactive Network Utility</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink uppercase">
            IP Calculator
          </h2>
          <p className="text-sm text-muted mt-1">
            Kalkulator subnetting dan analisis pengalamatan IPv4 (CIDR, netmask, broadcast, dan rentang host usable) untuk perencanaan jaringan.
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-surface/50 border border-border shadow-xs">
          <SubnetCalculator />
        </Card>
      </div>
    </section>
  );
}
