"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
  open: string | string[] | null;
  toggle: (value: string) => void;
  type: "single" | "multiple";
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordion() {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion components must be used within <Accordion>");
  return ctx;
}

function Accordion({
  type = "single",
  defaultValue,
  children,
  className,
}: {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState<string | string[] | null>(defaultValue ?? null);
  const toggle = (value: string) => {
    setOpen((prev) => {
      if (type === "single") return prev === value ? null : value;
      const arr = Array.isArray(prev) ? prev : [];
      return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    });
  };
  return (
    <AccordionContext.Provider value={{ open, toggle, type }}>
      <div className={cn("w-full", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ value, className, ...props }: React.ComponentProps<"div"> & { value: string }) {
  return <div data-slot="accordion-item" data-value={value} className={cn("border-b border-border last:border-b-0", className)} {...props} />;
}

function AccordionTrigger({ value, className, children, ...props }: React.ComponentProps<"button"> & { value: string }) {
  const { open, toggle } = useAccordion();
  const isOpen = Array.isArray(open) ? open.includes(value) : open === value;
  return (
    <h3>
      <button
        aria-expanded={isOpen}
        onClick={() => toggle(value)}
        className={cn("flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline text-left", className)}
        {...props}
      >
        {children}
        <svg
          className={cn("size-4 shrink-0 transition-transform duration-200", isOpen ? "rotate-180" : "")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </h3>
  );
}

function AccordionContent({ value, className, children, ...props }: React.ComponentProps<"div"> & { value: string }) {
  const { open } = useAccordion();
  const isOpen = Array.isArray(open) ? open.includes(value) : open === value;
  if (!isOpen) return null;
  return (
    <div
      data-slot="accordion-content"
      className={cn("overflow-hidden text-sm transition-all", className)}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
