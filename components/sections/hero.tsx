"use client";

import { motion } from "motion/react";
import { personal } from "@/data/config";
import { Button } from "@/components/ui/button";
import { Download, Mail } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-dvh flex items-center overflow-hidden pt-16">
      <div className="container-section relative z-10 py-20 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-status-up/30 bg-status-up/5 px-3 py-1 text-xs font-medium text-status-up mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-up opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-status-up" />
              </span>
              {personal.availability}
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl mb-4">
              {personal.name}
            </h1>
            <p className="text-xl font-semibold text-signal mb-4">
              {personal.title}
            </p>
            <p className="text-base text-muted leading-relaxed mb-2">
              {personal.focus}
            </p>
            <p className="text-sm text-muted mb-8">
              {personal.experience} pengalaman di {personal.location}.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href={personal.cvUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download CV
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#contact">
                  <Mail className="mr-2 h-4 w-4" />
                  Hubungi Saya
                </a>
              </Button>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <svg viewBox="0 0 500 400" className="w-full max-w-lg mx-auto" aria-hidden="true">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-signal)" stopOpacity="0" />
                  <stop offset="50%" stopColor="var(--color-signal)" stopOpacity="1" />
                  <stop offset="100%" stopColor="var(--color-signal)" stopOpacity="0" />
                </linearGradient>
              </defs>

              <motion.circle
                cx="250" cy="200" r="6" fill="var(--color-signal)"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              />
              <motion.circle cx="120" cy="80" r="5" fill="var(--color-ink)" initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 0.2 }} />
              <motion.circle cx="380" cy="100" r="5" fill="var(--color-ink)" initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 0.3 }} />
              <motion.circle cx="100" cy="280" r="5" fill="var(--color-ink)" initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 0.4 }} />
              <motion.circle cx="400" cy="300" r="5" fill="var(--color-ink)" initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 0.5 }} />

              <motion.path
                d="M250 200 L120 80"
                fill="none" stroke="url(#lineGrad)" strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
              <motion.path
                d="M250 200 L380 100"
                fill="none" stroke="url(#lineGrad)" strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.7 }}
              />
              <motion.path
                d="M250 200 L100 280"
                fill="none" stroke="url(#lineGrad)" strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.9 }}
              />
              <motion.path
                d="M250 200 L400 300"
                fill="none" stroke="url(#lineGrad)" strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 1.1 }}
              />

              <circle cx="120" cy="80" r="24" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
              <text x="120" y="84" textAnchor="middle" fontSize="9" fill="var(--color-muted)" fontFamily="IBM Plex Mono">Core</text>
              <circle cx="380" cy="100" r="24" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
              <text x="380" y="104" textAnchor="middle" fontSize="9" fill="var(--color-muted)" fontFamily="IBM Plex Mono">IXP</text>
              <circle cx="100" cy="280" r="24" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
              <text x="100" y="284" textAnchor="middle" fontSize="9" fill="var(--color-muted)" fontFamily="IBM Plex Mono">Edge</text>
              <circle cx="400" cy="300" r="24" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
              <text x="400" y="304" textAnchor="middle" fontSize="9" fill="var(--color-muted)" fontFamily="IBM Plex Mono">Cloud</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
