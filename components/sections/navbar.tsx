"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X, Download, Sun, Moon } from "lucide-react";
import { personal } from "@/data/config";

const navLinks = [
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

  // Lock body scroll and listen for Escape key when mobile menu is open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

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
    <header className="sticky top-0 z-50 w-full bg-canvas/90 backdrop-blur-md border-b border-border transition-all duration-200">
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

        {/* Mobile & Tablet Trigger Buttons */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <Button
            size="icon"
            variant="ghost"
            aria-label={dark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
            title={dark ? "Mode Terang" : "Mode Gelap"}
            onClick={toggleDark}
            className="h-9 w-9 text-muted hover:text-ink cursor-pointer"
          >
            {mounted && dark ? (
              <Sun className="h-4 w-4 text-signal" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Hamburger Navigation Button (3 Bars) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center h-9 w-9 rounded-md border border-border bg-surface/50 hover:bg-surface text-ink transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
            aria-label="Buka Menu Navigasi"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Backdrop + Slide-out Navigation) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Menu */}
          <div
            className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-canvas border-l border-border shadow-2xl p-6 z-50 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Menu Navigasi Mobile"
          >
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/70">
                <span className="font-mono text-xs uppercase tracking-wider text-muted font-semibold">
                  Menu Navigasi
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md p-1.5 text-muted hover:text-ink hover:bg-surface transition-colors cursor-pointer"
                  aria-label="Tutup Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Columns / Links */}
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-2.5 text-sm font-medium text-ink hover:text-signal hover:bg-surface/80 rounded-lg transition-colors flex items-center justify-between group"
                  >
                    <span>{link.label}</span>
                    <span className="text-muted/40 group-hover:text-signal transition-colors text-xs">→</span>
                  </Link>
                ))}

                <Link
                  href="/tools"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 text-sm font-medium text-signal hover:bg-surface/80 rounded-lg transition-colors flex items-center justify-between border-t border-border/50 mt-2 pt-3"
                >
                  <span>Diagnostic Tools (ISP/NOC)</span>
                  <span className="text-[10px] font-mono bg-surface px-1.5 py-0.5 rounded border border-border">/tools</span>
                </Link>
              </nav>
            </div>

            {/* Bottom Actions inside drawer */}
            <div className="pt-6 border-t border-border/60 flex flex-col gap-3">
              <Button size="sm" className="w-full h-10 font-semibold" asChild>
                <a href={personal.cvUrl} download onClick={() => setMobileMenuOpen(false)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Curriculum Vitae
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export { navLinks };
