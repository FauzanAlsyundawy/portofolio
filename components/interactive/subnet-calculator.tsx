"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { calculateSubnet, type SubnetResult, type SubnetError } from "@/lib/subnet-utils";

export function SubnetCalculator() {
  const [ip, setIp] = useState("192.168.1.0");
  const [prefix, setPrefix] = useState("24");

  // useMemo agar kalkulasi tidak berjalan ulang kecuali ip/prefix berubah
  const calcResult = useMemo(() => {
    return calculateSubnet(ip, Number.parseInt(prefix, 10));
  }, [ip, prefix]);

  const error = "error" in calcResult ? calcResult.error : null;
  const result: SubnetResult | null = !("error" in calcResult) ? calcResult : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <Label htmlFor="ip">IP Address</Label>
          <Input
            id="ip"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="192.168.1.0"
          />
        </div>
        <div>
          <Label htmlFor="prefix">Prefix CIDR</Label>
          <Input
            id="prefix"
            type="number"
            min={0}
            max={32}
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-status-critical">{error}</p>}
      </div>

      {result && !error && (
        <Card className="p-4 bg-surface">
          <h3 className="font-mono text-sm font-semibold text-ink mb-3">Result</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted">Network</dt>
              <dd className="font-mono text-ink">{result.networkAddress}/{prefix}</dd>
            </div>
            <div>
              <dt className="text-muted">Subnet Mask</dt>
              <dd className="font-mono text-ink">{result.subnetMask}</dd>
            </div>
            <div>
              <dt className="text-muted">Wildcard</dt>
              <dd className="font-mono text-ink">{result.wildcardMask}</dd>
            </div>
            <div>
              <dt className="text-muted">Broadcast</dt>
              <dd className="font-mono text-ink break-all">{result.broadcastAddress ?? "N/A (point-to-point)"}</dd>
            </div>
            <div>
              <dt className="text-muted">First Host</dt>
              <dd className="font-mono text-ink">{result.firstHost}</dd>
            </div>
            <div>
              <dt className="text-muted">Last Host</dt>
              <dd className="font-mono text-ink">{result.lastHost}</dd>
            </div>
            <div>
              <dt className="text-muted">Total Hosts</dt>
              <dd className="font-mono text-ink">{result.totalHosts.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-muted">Usable Hosts</dt>
              <dd className="font-mono text-ink">{result.usableHosts.toLocaleString()}</dd>
            </div>
          </dl>

          <div className="mt-4">
            <p className="text-xs text-muted mb-1">Binary (network bits bold)</p>
            {/* overflow-x-auto untuk mobile agar tidak overflow container */}
            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {result.binaryOctets.map((bin, i) => {
                  const prefixNum = Number.parseInt(prefix, 10);
                  const networkBits = prefixNum >= (i + 1) * 8 ? 8 : prefixNum > i * 8 ? prefixNum - i * 8 : 0;
                  return (
                    <span key={i} className="font-mono text-xs">
                      {bin.split("").map((bit, j) => (
                        <span
                          key={j}
                          className={j < networkBits ? "text-signal font-bold" : "text-muted"}
                        >
                          {bit}
                        </span>
                      ))}
                      {i < 3 && <span className="text-muted mx-1">.</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
