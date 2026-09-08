"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

function useTooltip() {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) throw new Error("Tooltip components must be used within <Tooltip>");
  return ctx;
}

function Tooltip({ children, content, open, onOpenChange }: { children: React.ReactNode; content: React.ReactNode; open?: boolean; onOpenChange?: (v: boolean) => void }) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  return (
    <TooltipContext.Provider value={{ open: isOpen, setOpen: setIsOpen }}>
      <div className="relative inline-flex">
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
        >
          {children}
        </div>
        {isOpen && (
          <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-ink text-white text-xs whitespace-nowrap shadow-lg">
            {content}
          </div>
        )}
      </div>
    </TooltipContext.Provider>
  );
}

export { Tooltip };
