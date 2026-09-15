"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { personal } from "@/data/config";
import { Button } from "@/components/ui/button";
import { Download, Mail } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex items-center overflow-hidden pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12 lg:pb-14">
      <div className="container-section relative z-10 py-8 lg:py-12">
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

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative flex items-center justify-center mt-8 lg:mt-0"
          >
            <div className="relative w-64 sm:w-72 lg:w-80 aspect-[541/799] max-w-full mx-auto">
              {/* Decorative subtle backdrop glow */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-signal/25 via-signal/10 to-transparent blur-xl -z-10 opacity-70" />
              <div className="relative h-full w-full rounded-2xl overflow-hidden border border-border shadow-2xl bg-surface">
                <Image
                  src="/profile.png"
                  alt={personal.name}
                  width={541}
                  height={799}
                  priority
                  className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-102"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
