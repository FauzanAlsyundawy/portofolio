"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SheetContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  side?: "top" | "bottom" | "left" | "right";
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheet() {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("Sheet components must be used within <Sheet>");
  return ctx;
}

function Sheet({
  open,
  onOpenChange,
  children,
  side = "right",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onOpenChange(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const positionClass =
    side === "right"
      ? "right-0 top-0 h-full"
      : side === "left"
        ? "left-0 top-0 h-full"
        : side === "top"
          ? "top-0 left-0 w-full"
          : "bottom-0 left-0 w-full";

  return (
    <SheetContext.Provider value={{ open, setOpen: onOpenChange, side }}>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
          <div className={`absolute ${positionClass}`}>{children}</div>
        </div>
      )}
    </SheetContext.Provider>
  );
}

function SheetContent({ className, children, side }: React.ComponentProps<"div"> & { side?: "top" | "bottom" | "left" | "right" }) {
  const orientation = side === "top" || side === "bottom" ? "horizontal" : "vertical";
  return (
    <div
      data-slot="sheet-content"
      className={cn(
        "bg-canvas border-border shadow-lg p-6 overflow-y-auto",
        orientation === "vertical" ? "border-l h-full w-72" : "border-t h-72 w-full",
        className
      )}
      {...(side ? {} : {})}
    >
      {children}
    </div>
  );
}

function SheetTrigger({ asChild, children, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? "span" : "button";
  return <Comp {...props}>{children}</Comp>;
}

function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-lg font-semibold text-ink", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-muted", className)} {...props} />;
}

export { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription };
