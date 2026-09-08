"use client";

import { motion, useInView } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { metrics } from "@/data/config";
import { Activity, Network, Radio, Timer } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Activity,
  Network,
  Radio,
  Timer,
};

function CountUp({ target, suffix, inView }: { target: string; suffix: string; inView: boolean }) {
  const [display, setDisplay] = useState("0");
  const numTarget = Number.parseInt(target.replace(/\D/g, ""), 10) || 0;

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * numTarget);
      setDisplay(String(current));
      if (progress < 1) requestAnimationFrame(tick);
      else setDisplay(target);
    };
    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, numTarget]);

  return <span>{display}{suffix}</span>;
}

export function Metrics() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="metrics" className="py-20 bg-surface">
      <div className="container-section">
        <h2 className="text-2xl font-semibold tracking-tight text-ink mb-8">
          Quick Metrics
        </h2>
        <div ref={ref} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, idx) => {
            const Icon = iconMap[metric.icon] || Activity;
            return (
              <Card key={idx} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-signal/10 text-signal">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wide text-muted">
                    {metric.label}
                  </span>
                </div>
                <div className="font-mono text-3xl font-bold text-ink">
                  {inView ? (
                    <CountUp target={metric.value} suffix={metric.suffix} inView={inView} />
                  ) : (
                    <span>0{metric.suffix}</span>
                  )}
                </div>
                {metric.detail && (
                  <p className="text-xs text-muted mt-1">{metric.detail}</p>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
