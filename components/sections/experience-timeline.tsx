"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { experience } from "@/data/experience";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, CheckCircle2 } from "lucide-react";

export function ExperienceTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="experience" className="py-20 bg-canvas">
      <div className="container-section">
        <h2 className="text-2xl font-semibold tracking-tight text-ink mb-8">
          Riwayat Pengalaman
        </h2>

        <div ref={ref} className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border md:left-8" />

          <div className="space-y-8">
            {experience.map((entry, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.1, 0.3) }}
                className="relative pl-16 md:pl-24"
              >
                <div className="absolute left-4 md:left-6 top-1 h-3 w-3 rounded-full border-2 border-signal bg-canvas" />

                <Card className="p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-ink">{entry.company}</h3>
                    {!entry.endDate && (
                      <Badge className="text-xs bg-status-up/10 text-status-up border-status-up/20 border">Present</Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-signal mb-1">{entry.role}</p>
                  <p className="text-xs text-muted font-mono mb-4">
                    {entry.startDate} — {entry.endDate ?? "Present"}
                  </p>
                  <ul className="space-y-2">
                    {entry.highlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-status-up shrink-0" />
                        {hl}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
