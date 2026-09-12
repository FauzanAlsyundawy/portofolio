"use client";

import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { skills } from "@/data/skills";
import {
  Network,
  FlaskConical,
  Server,
  Settings,
  Globe,
  Code,
  Radar as RadarIcon,
} from "lucide-react";

// Lazy-load Recharts agar tidak membebani First Load JS bundle
const SkillRadarChart = dynamic(
  () => import("@/components/interactive/skill-radar-chart"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-3 p-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mx-auto h-56 w-56 rounded-full" />
      </div>
    ),
  }
);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Network,
  FlaskConical,
  Server,
  Settings,
  Globe,
  Code,
};

export function SkillsMatrix() {
  return (
    <section id="skills" className="py-20 bg-canvas">
      <div className="container-section">
        <h2 className="text-2xl font-semibold tracking-tight text-ink mb-2">
          Tools &amp; Protocols
        </h2>
        <p className="text-muted mb-8">Matriks keahlian teknis — Klik kategori untuk detail.</p>

        <Tabs defaultValue={skills[0]?.name} className="w-full">
          <TabsList className="mb-6 flex flex-wrap h-auto gap-1.5 p-1.5 bg-surface border border-border rounded-lg max-w-full">
            {skills.map((cat) => {
              const Icon = iconMap[cat.icon] || Network;
              return (
                <TabsTrigger
                  key={cat.name}
                  value={cat.name}
                  className="data-[state=active]:bg-canvas data-[state=active]:text-ink text-muted hover:text-ink transition-colors"
                >
                  <Icon className="mr-1.5 h-4 w-4" />
                  {cat.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="grid gap-8 lg:grid-cols-3 items-start">
            <div className="lg:col-span-2">
              {skills.map((cat) => (
                <TabsContent key={cat.name} value={cat.name} className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex flex-wrap gap-2"
                  >
                    {cat.items.map((item) => (
                      <Badge
                        key={item.label}
                        variant="outline"
                        className="px-3 py-1.5 text-sm font-medium bg-canvas hover:border-signal/60 hover:text-signal transition-colors shadow-2xs"
                      >
                        {item.label}
                      </Badge>
                    ))}
                  </motion.div>
                </TabsContent>
              ))}
            </div>

            {/* Radar chart responsive: stacked on mobile/tablet, on the right on desktop */}
            <div className="w-full lg:col-span-1">
              <Card className="p-4 sm:p-5 border border-border bg-surface/50">
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted">
                  <RadarIcon className="h-4 w-4 text-signal" />
                  Competency Radar
                  <span className="ml-auto text-xs text-muted/60 font-mono">Score / 5</span>
                </div>
                <SkillRadarChart />
              </Card>
            </div>
          </div>
        </Tabs>
      </div>
    </section>
  );
}
