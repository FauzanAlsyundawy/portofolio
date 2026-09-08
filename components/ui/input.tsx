import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted selection:bg-signal selection:text-white flex h-9 w-full min-w-0 rounded-md border border-border bg-canvas px-3 py-1 text-base transition-shadow outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted selection:bg-signal selection:text-white flex min-h-16 w-full rounded-md border border-border bg-canvas px-3 py-2 text-base transition-shadow outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
}

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn("flex items-center gap-2 text-sm leading-none font-medium select-none", className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="separator-root"
      role="none"
      className={cn("bg-border shrink-0", className)}
      {...props}
    />
  );
}

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-surface animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Input, Textarea, Label, Separator, Skeleton };
