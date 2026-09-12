"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Server, FlaskConical, Wrench } from "lucide-react";

const skillCategories = [
  {
    title: "NETWORKING",
    emoji: "🌐",
    icon: Globe,
    skills: [
      "MikroTik",
      "Cisco",
      "Juniper",
      "VLAN",
      "OSPF",
      "BGP",
      "Static Routing",
      "Dynamic Routing",
      "DHCP",
      "NAT",
    ],
  },
  {
    title: "SERVER & VIRTUALIZATION",
    emoji: "🖥",
    icon: Server,
    skills: [
      "Linux",
      "Ubuntu Server",
      "Proxmox",
      "VMware",
      "SSH",
      "Virtualization",
    ],
  },
  {
    title: "NETWORK LAB & TOOLS",
    emoji: "🧪",
    icon: FlaskConical,
    skills: [
      "PNETLab",
      "Cisco Packet Tracer",
      "Winbox",
      "PuTTY",
      "Draw.io",
    ],
  },
  {
    title: "FIELD & INFRASTRUCTURE",
    emoji: "⚙️",
    icon: Wrench,
    skills: [
      "Data Center Operations",
      "Network Troubleshooting",
      "Rack & Server",
      "SFP / Connectivity",
      "Field Operations",
    ],
  },
];

export function TechnicalSkills() {
  return (
    <section id="technical-skills" className="py-16 sm:py-20 bg-canvas relative">
      <div className="container-section">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-ink uppercase">
            TECHNICAL SKILLS
          </h2>
        </motion.div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {skillCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="h-full"
              >
                <Card className="p-6 sm:p-7 h-full flex flex-col justify-between hover:shadow-md hover:border-signal/40 transition-all border border-border bg-surface/50">
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-signal/10 text-signal text-base">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="font-semibold text-base sm:text-lg text-ink tracking-tight flex items-center gap-2">
                        <span>{cat.emoji}</span>
                        <span>{cat.title}</span>
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {cat.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-canvas hover:border-signal/60 hover:text-signal transition-colors shadow-2xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
