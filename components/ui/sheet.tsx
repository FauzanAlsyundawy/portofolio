"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  side: "top" | "bottom" | "left" | "right";
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  return (
    <SheetContext.Provider value={{ open, setOpen: onOpenChange, side }}>
      {children}
    </SheetContext.Provider>
  );
}

function SheetTrigger({
  asChild,
  children,
  onClick,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { setOpen } = useSheet();

  if (asChild && React.isValidElement(children)) {
    const childElement = children as React.ReactElement<{ onClick?: React.MouseEventHandler<HTMLElement> }>;
    return React.cloneElement(childElement, {
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        childElement.props.onClick?.(e);
        setOpen(true);
      },
    });
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        onClick?.(e);
        setOpen(true);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function SheetClose({
  asChild,
  children,
  onClick,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { setOpen } = useSheet();

  if (asChild && React.isValidElement(children)) {
    const childElement = children as React.ReactElement<{ onClick?: React.MouseEventHandler<HTMLElement> }>;
    return React.cloneElement(childElement, {
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        childElement.props.onClick?.(e);
        setOpen(false);
      },
    });
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function SheetContent({
  className,
  children,
  side: sideProp,
  ...props
}: React.ComponentProps<"div"> & { side?: "top" | "bottom" | "left" | "right" }) {
  const { open, setOpen, side: contextSide } = useSheet();
  const side = sideProp || contextSide || "right";

  if (!open) return null;

  const positionClass =
    side === "right"
      ? "right-0 top-0 h-full w-80 max-w-[85vw] border-l"
      : side === "left"
        ? "left-0 top-0 h-full w-80 max-w-[85vw] border-r"
        : side === "top"
          ? "top-0 left-0 w-full h-auto border-b"
          : "bottom-0 left-0 w-full h-auto border-t";

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 bg-canvas border-border shadow-2xl p-6 overflow-y-auto flex flex-col justify-between transition-transform duration-200",
          positionClass,
          className
        )}
        {...props}
      >
        {children}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted hover:text-ink hover:bg-surface transition-colors cursor-pointer"
          aria-label="Tutup Menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 text-left mb-6", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-base font-semibold text-ink", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-muted", className)} {...props} />;
}

export { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription };
