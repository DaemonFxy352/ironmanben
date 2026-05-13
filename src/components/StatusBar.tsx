"use client";

import { useState, useEffect } from "react";

interface StatusBarProps {
  stage?: string;
  stageEmoji?: string;
  etaLabel?: string;
  etaTime?: string;
  nextCheckpoint?: string;
  pulseEmoji?: boolean;
}

export function StatusBar({
  stage = "Swimming",
  stageEmoji = "🏊",
  etaLabel = "ETA T1",
  etaTime = "8:45 AM",
  nextCheckpoint = "Memorial Park / Transition",
  pulseEmoji = false,
}: StatusBarProps) {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (pulseEmoji) {
      setIsPulsing(true);
      const timeout = setTimeout(() => setIsPulsing(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [pulseEmoji]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border border-l-4 border-l-accent-warm">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Stage */}
          <div className="flex items-center gap-2">
            <span
              className={`text-2xl ${isPulsing ? "stage-emoji-pulse" : ""}`}
              aria-hidden="true"
            >
              {stageEmoji}
            </span>
            <span className="text-xl font-bold text-primary-text">{stage}</span>
          </div>

          {/* Right: ETA */}
          <div className="text-right">
            <div className="text-xs font-semibold text-muted uppercase tracking-wide">
              {etaLabel}
            </div>
            <div className="text-xl font-bold text-primary">{etaTime}</div>
          </div>
        </div>

        {/* Next checkpoint */}
        <div className="mt-1 text-[13px] text-muted">
          NEXT: {nextCheckpoint}
        </div>
      </div>
    </div>
  );
}
