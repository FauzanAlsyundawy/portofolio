"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Download, Sun, Moon } from "lucide-react";
import { personal } from "@/data/config";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#metrics", label: "Metrics" },
  { href: "/#skills", label: "Skills" },
  { href: "/#case-studies", label: "Case Studies" },
  { href: "/#experience", label: "Experience" },
  { href: "/#certifications", label: "Certifications" },
  { href: "/#lab", label: "Lab" },
  { href: "/#contact", label: "Contact" },
  { href: "/tools", label: "Tools" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-canvas/80 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-md"
        >
          <div className="relative flex items-center shrink-0">
            <Image
              src="/logo-light.png"
              alt="Falsyundawy IT Support"
              width={120}
              height={98}
              className="h-8 sm:h-9 w-auto object-contain dark:hidden transition-transform duration-200 group-hover:scale-105"
              priority
            />
            <Image
              src="/logo-dark.png"
              alt="Falsyundawy IT Support"
              width={120}
              height={98}
              className="h-8 sm:h-9 w-auto object-contain hidden dark:block transition-transform duration-200 group-hover:scale-105"
              priority
            />
          </div>
          <span className="font-sans font-bold text-sm sm:text-base tracking-tight text-black dark:text-white whitespace-nowrap transition-colors">
            {personal.name}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted hover:text-ink transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Button size="sm" variant="default" asChild>
            <a href={personal.cvUrl} download>
              <Download className="mr-2 h-4 w-4" />
              CV
            </a>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={dark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
            title={dark ? "Mode Terang" : "Mode Gelap"}
            onClick={toggleDark}
            className="hidden md:inline-flex text-muted hover:text-ink cursor-pointer"
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
          <kbd className="hidden xl:inline-flex items-center gap-1 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-xs text-muted select-none" title="Buka Command Palette">
            <span>⌘</span>K
          </kbd>
        </nav>

        <div className="flex md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="font-mono text-sm text-muted mb-4">Menu</SheetTitle>
              <nav className="flex flex-col gap-4" aria-label="Mobile">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSheetOpen(false)}
                    className="text-base font-medium text-ink hover:text-signal transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <Button size="sm" className="mt-2" asChild>
                  <a href={personal.cvUrl} download>
                    <Download className="mr-2 h-4 w-4" />
                    Download CV
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleDark}
                  className="mt-2 w-full justify-start gap-2"
                >
                  {mounted && dark ? (
                    <>
                      <Sun className="h-4 w-4 text-signal" />
                      <span>Mode Terang</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      <span>Mode Gelap</span>
                    </>
                  )}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export { navLinks };
