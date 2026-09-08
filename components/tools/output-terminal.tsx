"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface OutputTerminalProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  isRunning?: boolean;
  maxHeight?: string;
  onClear?: () => void;
}

export function OutputTerminal({
  title,
  children,
  className,
  isRunning = false,
  maxHeight = "max-h-96",
  onClear,
}: OutputTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // If user is near bottom (< 40px away), keep auto-scrolling
    const isAtBottom = scrollHeight - (scrollTop + clientHeight) < 40;
    setUserHasScrolledUp(!isAtBottom);
  };

  useEffect(() => {
    if (!userHasScrolledUp && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [children, userHasScrolledUp]);

  return (
    <div
      className={cn(
        "rounded-md border border-[#1E293B] bg-[#0F172A] text-[#E2E8F0] font-mono text-xs sm:text-sm shadow-md overflow-hidden",
        className
      )}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-[#1E293B] bg-[#0B1220] px-3.5 py-2 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/90 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/90 inline-block" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]/90 inline-block" />
          </div>
          <span className="text-xs text-[#94A3B8] font-mono tracking-tight ml-2 truncate max-w-xs sm:max-w-md">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              PROBING
            </span>
          )}
          {onClear && (
            <button
              onClick={onClear}
              className="text-[11px] text-[#64748B] hover:text-[#CBD5E1] transition-colors px-1.5 py-0.5 rounded cursor-pointer"
              title="Clear terminal"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          "p-3.5 overflow-y-auto overflow-x-auto space-y-1 font-mono leading-relaxed selection:bg-cyan-900/60 selection:text-cyan-200",
          maxHeight
        )}
      >
        {children}
        {isRunning && (
          <div className="inline-flex items-center gap-1 text-cyan-400 pt-1">
            <span className="animate-pulse">▋</span>
          </div>
        )}
        <div ref={bottomRef} className="h-0" />
      </div>
    </div>
  );
}
