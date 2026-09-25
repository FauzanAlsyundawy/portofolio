"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, Sun, Moon } from "lucide-react";
import { personal } from "@/data/config";

const navLinks = [
  { href: "/#hero", label: "Beranda" },
  { href: "/#about", label: "Tentang Saya" },
  { href: "/#technical-skills", label: "Technical Skills" },
  { href: "/#skills", label: "Tools & Skills" },
  { href: "/#ip-calculator", label: "IP Calculator" },
  { href: "/#experience", label: "Pengalaman" },
  { href: "/#certifications", label: "Sertifikasi" },
  { href: "/#contact", label: "Kontak" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      setDark(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  }, []);

  const toggleDark = () => {
    const nextDark = !dark;
    setDark(nextDark);
    const root = document.documentElement;
    if (nextDark) {
      root.classList.add("dark");
      try {
        localStorage.setItem("theme", "dark");
      } catch {}
    } else {
      root.classList.remove("dark");
      try {
        localStorage.setItem("theme", "light");
      } catch {}
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-canvas/95 backdrop-blur-md border-b border-border transition-all duration-200">
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Logo and Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-md py-1"
        >
          <div className="relative flex items-center shrink-0">
            <Image
              src="/logo-light.png"
              alt="Falsyundawy IT Support"
              width={343}
              height={280}
              className="h-9 sm:h-11 w-auto object-contain dark:hidden transition-transform duration-200 group-hover:scale-105"
              priority
            />
            <Image
              src="/logo-dark.png"
              alt="Falsyundawy IT Support"
              width={343}
              height={280}
              className="h-9 sm:h-11 w-auto object-contain hidden dark:block transition-transform duration-200 group-hover:scale-105"
              priority
            />
          </div>
          <span className="font-sans font-bold text-sm sm:text-base lg:text-lg tracking-tight text-ink whitespace-nowrap transition-colors">
            {personal.name}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 2xl:gap-2 shrink-0" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs xl:text-[13px] 2xl:text-sm font-medium text-muted hover:text-ink hover:bg-surface/80 px-2 xl:px-2.5 2xl:px-3 py-1.5 rounded-md whitespace-nowrap transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="flex items-center gap-1.5 xl:gap-2 ml-1 pl-2 border-l border-border/80">
            <Button size="sm" variant="default" asChild className="h-8 px-3 text-xs font-semibold">
              <a href={personal.cvUrl} download>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                CV
              </a>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={dark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
              title={dark ? "Mode Terang" : "Mode Gelap"}
              onClick={toggleDark}
              className="h-8 w-8 text-muted hover:text-ink cursor-pointer"
            >
              {mounted ? (
                dark ? (
                  <Sun className="h-4 w-4 text-signal transition-transform duration-200 rotate-0 scale-100" />
                ) : (
                  <Moon className="h-4 w-4 text-muted hover:text-ink transition-transform duration-200 rotate-0 scale-100" />
                )
              ) : (
                <span className="h-4 w-4" />
              )}
            </Button>
            <kbd
              className="hidden 2xl:inline-flex items-center gap-1 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted select-none"
              title="Buka Command Palette"
            >
              <span>⌘</span>K
            </kbd>
          </div>
        </nav>

        {/* Mobile Hamburger Button (Only 3 clean horizontal bars on top right, exactly like reference) */}
        <div className="flex lg:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-ink hover:text-signal rounded-md transition-colors cursor-pointer focus:outline-none"
            aria-label="Menu Navigasi"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-7 h-7 text-ink"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu (Centered stack directly below header, exactly matching reference image) */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-canvas/98 border-t border-border shadow-2xl py-6 px-4 transition-all duration-200">
          <nav className="flex flex-col items-center justify-center gap-2.5 text-center" aria-label="Mobile">
            {navLinks.map((link, idx) => {
              const isFirst = idx === 0;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-colors py-2 px-5 rounded-xl ${
                    isFirst
                      ? "bg-signal/15 text-signal font-semibold shadow-xs"
                      : "text-ink/80 hover:text-signal hover:bg-surface"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              href="/tools"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-signal hover:bg-surface py-2 px-5 rounded-xl transition-colors"
            >
              Diagnostic Tools (ISP/NOC)
            </Link>

            {/* Download CV */}
            <div className="w-full max-w-[220px] pt-2">
              <Button size="sm" className="w-full h-9 font-semibold" asChild>
                <a href={personal.cvUrl} download onClick={() => setMobileMenuOpen(false)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download CV
                </a>
              </Button>
            </div>

            {/* Centered Theme Toggle in Rounded Box (Exactly like reference image) */}
            <div className="pt-3">
              <button
                type="button"
                onClick={toggleDark}
                className="flex items-center justify-center w-12 h-12 rounded-2xl border border-border bg-surface hover:bg-border/60 text-ink shadow-xs transition-colors cursor-pointer"
                aria-label={dark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
                title={dark ? "Mode Terang" : "Mode Gelap"}
              >
                {mounted && dark ? (
                  <Sun className="h-5 w-5 text-signal" />
                ) : (
                  <Moon className="h-5 w-5 text-ink fill-ink/10" />
                )}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export { navLinks };
