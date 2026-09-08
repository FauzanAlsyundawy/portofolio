"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const commands: Record<string, string> = {
  "show ip bgp summary": `BGP router identifier 192.0.2.1, local AS number 64512
BGP table version 450001, main routing table version 450001
Neighbor        V    AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down State/PrefRcvd
198.51.100.1    4  64512  284192  284192  450001    0    0 4w2d           4500
203.0.113.1     4  64513  192403  192403  450001    0    0 4w2d           3200`,
  "show ip route": `Codes: C - connected, S - static, B - BGP, O - OSPF

Gateway of last resort is 198.51.100.1 to network 0.0.0.0

B    192.0.2.0/24 [20/0] via 198.51.100.1, 4w2d
B    198.51.100.0/24 [20/0] via 198.51.100.1, 4w2d
C    203.0.113.0/24 is directly connected, GigabitEthernet0/1
O    10.0.0.0/8 [110/2] via 192.0.2.1, 4w2d`,
  "traceroute 203.0.113.1": `traceroute to 203.0.113.1, 30 hops max
 1  192.168.1.1 (192.168.1.1)  0.423 ms  0.312 ms  0.298 ms
 2  198.51.100.1 (198.51.100.1)  1.102 ms  1.045 ms  0.987 ms
 3  203.0.113.1 (203.0.113.1)  4.521 ms  4.412 ms  4.389 ms`,
  "show version": `Cisco IOS Software, C880 Software (C880DATA-UNIVERSALK9-M), Version 15.4(3)M2
Technical Support: http://www.cisco.com/techsupport
Compiled Mon 01-Jul-13 15:58 by prod_rel_team
ROM: System Bootstrap, Version 12.4(22r)YB5, RELEASE SOFTWARE (fc1)
Router uptime is 4 weeks, 2 days, 18 hours, 32 minutes
System returned to ROM by reload at 15:42:42 UTC Mon Aug 12 2024
System image file is "flash:c880data-universalk9-mz.154-3m2.bin"
...`,
};

function TypeWriter({ text }: { text: string }) {
  const [display, setDisplay] = useState("");
  const index = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplay("");
    index.current = 0;
    const tick = () => {
      if (index.current < text.length) {
        setDisplay((prev) => prev + text[index.current]);
        index.current += 1;
        timeoutRef.current = setTimeout(tick, 8);
      }
    };
    timeoutRef.current = setTimeout(tick, 300);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [text]);

  return <pre className="whitespace-pre-wrap break-words font-mono text-xs">{display}</pre>;
}

export function CliTerminal() {
  const [active, setActive] = useState<string>("show ip bgp summary");

  return (
    <div className="bg-ink text-green-400 font-mono">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-4 text-xs text-white/40">admin@core-router-01:~$</span>
      </div>

      <div className="p-4">
        <Tabs defaultValue="show ip bgp summary" value={active} onValueChange={setActive} className="w-full">
          {/* overflow-x-auto agar tab panjang bisa di-scroll di mobile */}
          <div className="overflow-x-auto">
            <TabsList className="mb-4 bg-white/5 flex-nowrap w-max min-w-full">
              {Object.keys(commands).map((cmd) => (
                <TabsTrigger key={cmd} value={cmd} className="text-xs data-[state=active]:bg-white/10 shrink-0">
                  {cmd}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {Object.entries(commands).map(([cmd, output]) => (
            <TabsContent key={cmd} value={cmd}>
              <TypeWriter key={active} text={`$ ${cmd}\n${output}`} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
