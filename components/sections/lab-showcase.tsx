"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { SubnetCalculator } from "@/components/interactive/subnet-calculator";
import { CliTerminal } from "@/components/interactive/cli-terminal";

export function LabShowcase() {
  return (
    <section id="lab" className="py-20 bg-canvas">
      <div className="container-section">
        <h2 className="text-2xl font-semibold tracking-tight text-ink mb-2">
          Interaktif / Lab Showcase
        </h2>
        <p className="text-muted mb-8">
          Kalkulator subnet dan preview CLI untuk menunjang validasi kompetensi teknis.
        </p>

        <Tabs defaultValue="subnet" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="subnet">Subnet Calculator</TabsTrigger>
            <TabsTrigger value="cli">Terminal CLI</TabsTrigger>
          </TabsList>

          <TabsContent value="subnet">
            <Card className="p-6">
              <SubnetCalculator />
            </Card>
          </TabsContent>

          <TabsContent value="cli">
            <Card className="p-0 overflow-hidden">
              <CliTerminal />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
