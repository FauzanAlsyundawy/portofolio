"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CommandContextValue {
  search: string;
  setSearch: (v: string) => void;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);

function useCommand() {
  const ctx = React.useContext(CommandContext);
  if (!ctx) throw new Error("Command components must be used within <Command>");
  return ctx;
}

function Command({ children, className, ...props }: React.ComponentProps<"div">) {
  const [search, setSearch] = React.useState("");
  return (
    <CommandContext.Provider value={{ search, setSearch }}>
      <div
        role="command"
        data-slot="command"
        className={cn("bg-canvas border border-border rounded-lg shadow-lg overflow-hidden", className)}
        {...props}
      >
        {children}
      </div>
    </CommandContext.Provider>
  );
}

function CommandDialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (v: boolean) => void; children: React.ReactNode }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onOpenChange(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-lg mx-4">{children}</div>
    </div>
  );
}

function CommandInput({ className, ...props }: React.ComponentProps<"input">) {
  const { setSearch } = useCommand();
  return (
    <input
      autoFocus
      onChange={(e) => setSearch(e.target.value)}
      className={cn("flex h-11 w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm outline-none", className)}
      {...props}
    />
  );
}

function CommandList({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="command-list" className={cn("max-h-72 overflow-y-auto", className)} {...props} />;
}

function CommandEmpty({ className, ...props }: React.ComponentProps<"p">) {
  const { search } = useCommand();
  if (!search) return null;
  return <p className={cn("py-6 text-center text-sm text-muted", className)} {...props} />;
}

function CommandGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="command-group" className={cn("overflow-hidden", className)} {...props} />;
}

function CommandItem({ className, onSelect, children, ...props }: React.ComponentProps<"div"> & { onSelect?: () => void }) {
  const { search } = useCommand();
  const lower = children?.toString().toLowerCase() ?? "";
  if (search && !lower.includes(search.toLowerCase())) return null;
  return (
    <div
      role="option"
      tabIndex={0}
      onClick={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-surface focus:bg-surface",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CommandSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="command-separator" className={cn("bg-border h-px", className)} {...props} />;
}

export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator };
