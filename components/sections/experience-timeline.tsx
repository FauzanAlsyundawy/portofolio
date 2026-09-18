"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import Image from "next/image";
import { experience } from "@/data/experience";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calendar, Building2 } from "lucide-react";

export function ExperienceTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="experience" className="py-20 bg-canvas">
      <div className="container-section">
        <div className="mb-10">
          <h2 className="text-2xl font-semibold tracking-tight text-ink uppercase">
            Riwayat Pengalaman
          </h2>
          <p className="text-sm text-muted mt-1">
            Pengalaman kerja profesional dan praktik lapangan dalam infrastruktur jaringan & data center
          </p>
        </div>

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
                {/* Timeline node */}
                <div className="absolute left-4 md:left-6 top-7 h-3 w-3 rounded-full border-2 border-signal bg-canvas">
                  {!entry.endDate && (
                    <span className="absolute -inset-1 rounded-full bg-signal/30 animate-ping" />
                  )}
                </div>

                <Card className="p-6 sm:p-7 transition-all duration-300 hover:shadow-md hover:border-signal/40 bg-surface/50 border border-border group">
                  {/* Header: Company Logo & Info */}
                  <div className="flex items-start gap-4">
                    {entry.logo ? (
                      <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-xl border border-border bg-white p-2 shadow-xs flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                        <Image
                          src={entry.logo}
                          alt={entry.company}
                          width={96}
                          height={96}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-xl border border-border bg-signal/10 text-signal flex items-center justify-center">
                        <Building2 className="h-7 w-7" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base sm:text-lg text-ink tracking-tight">
                          {entry.company}
                        </h3>
                        {!entry.endDate ? (
                          <Badge className="text-xs bg-status-up/10 text-status-up border-status-up/20 border font-medium">
                            Present
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted font-mono">
                            PKL Selesai
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-signal">{entry.role}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted font-mono mt-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted/70 shrink-0" />
                        <span>{entry.startDate} — {entry.endDate ?? "Present"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border/60 my-5" />

                  {/* Highlights list */}
                  <ul className="space-y-2.5">
                    {entry.highlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-muted leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-status-up shrink-0" />
                        <span>{hl}</span>
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
