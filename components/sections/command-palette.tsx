"use client";

import { useEffect, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { contactSocials, personal } from "@/data/config";
import { navLinks } from "@/components/sections/navbar";
import { cn } from "@/lib/utils";

const toggleTheme = () => {
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  if (isDark) {
    root.classList.remove("dark");
    try { localStorage.setItem("theme", "light"); } catch {}
  } else {
    root.classList.add("dark");
    try { localStorage.setItem("theme", "dark"); } catch {}
  }
};

const actions = [
  { label: "Ganti Mode Gelap / Terang", action: toggleTheme },
  { label: "Download CV", action: () => window.open(personal.cvUrl, "_blank") },
  { label: "Kirim Email", action: () => window.open(`mailto:${personal.email}`, "_blank") },
  { label: "Buka WhatsApp", action: () => window.open(contactSocials[1]?.href, "_blank") },
  { label: "Buka LinkedIn", action: () => window.open(personal.linkedin, "_blank") },
  { label: "Buka GitHub", action: () => window.open(personal.github, "_blank") },
];

function Group({ heading, children, className }: { heading: string; children: React.ReactNode; className?: string }) {
  return (
    <div data-slot="command-group" className={cn("overflow-hidden", className)}>
      <div className="px-2 py-1.5 text-xs font-medium text-muted">{heading}</div>
      {children}
    </div>
  );
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleNav = (href: string) => {
    setOpen(false);
    if (href.startsWith("/#")) {
      const hash = href.replace("/", "");
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = href;
      }
    } else {
      window.location.href = href;
    }
  };

  const toolCommands = [
    { label: "Buka Network Diagnostic Suite (/tools)", href: "/tools" },
    { label: "Jalankan Ping Tool", href: "/tools?tool=ping" },
    { label: "Jalankan Traceroute Tool", href: "/tools?tool=traceroute" },
    { label: "Jalankan WHOIS / RDAP Lookup", href: "/tools?tool=whois" },
    { label: "Jalankan Speed Test Throughput", href: "/tools?tool=speedtest" },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Ketik perintah, nama tool, atau section..." />
        <CommandList>
          <CommandEmpty>Tidak ada hasil.</CommandEmpty>
          <Group heading="Diagnostic Tools (ISP/NOC)">
            {toolCommands.map((tc) => (
              <CommandItem key={tc.href} onSelect={() => handleNav(tc.href)}>
                {tc.label}
              </CommandItem>
            ))}
          </Group>
          <CommandSeparator />
          <Group heading="Navigation">
            {navLinks.map((link) => (
              <CommandItem key={link.href} onSelect={() => handleNav(link.href)}>
                {link.label}
              </CommandItem>
            ))}
          </Group>
          <CommandSeparator />
          <Group heading="Aksi">
            {actions.map((action, idx) => (
              <CommandItem key={idx} onSelect={() => { setOpen(false); action.action(); }}>
                {action.label}
              </CommandItem>
            ))}
          </Group>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
