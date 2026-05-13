"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type CollapsedRaceInfo = {
  etaLabel: string;
  icon: string;
  isStale?: boolean;
  nextLabel: string;
  nextMiles: string;
  statusText: string;
};

type DraggableInfoSheetProps = {
  children?: ReactNode;
  collapsedInfo: CollapsedRaceInfo;
  isExpanded: boolean;
  onExpandedChange: (isExpanded: boolean) => void;
  quickSync: ReactNode;
  timeline: ReactNode;
  watermarkSrc?: string;
};

export function DraggableInfoSheet({
  children,
  collapsedInfo,
  isExpanded,
  onExpandedChange,
  quickSync,
  timeline,
  watermarkSrc,
}: DraggableInfoSheetProps) {
  return (
    <motion.section
      animate={{ height: isExpanded ? "min(68dvh, 640px)" : 64 }}
      className="fixed left-3 right-3 z-[1300] mx-auto max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 text-white shadow-2xl backdrop-blur-xl"
      drag="y"
      dragConstraints={{ bottom: 0, top: 0 }}
      dragElastic={0.08}
      dragMomentum={false}
      initial={false}
      style={{ bottom: "calc(7.25rem + env(safe-area-inset-bottom, 0px))" }}
      transition={{ damping: 34, stiffness: 360, type: "spring" }}
      onDragEnd={(_, info) => {
        if (info.offset.y < -32 || info.velocity.y < -260) {
          onExpandedChange(true);
        } else if (info.offset.y > 32 || info.velocity.y > 260) {
          onExpandedChange(false);
        }
      }}
    >
      <button
        className="relative z-10 flex h-16 w-full items-center gap-3 border-0 bg-transparent px-4 text-left transition-all active:scale-[0.99]"
        type="button"
        onClick={() => onExpandedChange(!isExpanded)}
      >
        <span className="text-2xl leading-none" aria-hidden="true">
          {collapsedInfo.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black leading-5 text-white">
            {collapsedInfo.statusText}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                collapsedInfo.isStale ? "bg-yellow-300" : "bg-lime-300"
              }`}
            />
            <span className="truncate text-[0.68rem] font-black uppercase text-white/45">
              Next: {collapsedInfo.nextLabel} in {collapsedInfo.nextMiles}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right font-mono">
          <p className="text-[0.62rem] font-black uppercase text-white/45">ETA</p>
          <p className="text-sm font-black text-lime-300">{collapsedInfo.etaLabel}</p>
        </div>
      </button>

      {isExpanded ? (
        <div className="relative h-[calc(100%-4rem)]">
          {watermarkSrc ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: `linear-gradient(rgba(9,9,11,0.35), rgba(9,9,11,0.82)), url(${watermarkSrc})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            />
          ) : null}
          <div className="scroll-smooth-ios relative z-10 h-full overflow-y-auto px-3 pb-4">
          <div className="space-y-3">
            {timeline}
            {quickSync}
            {children}
          </div>
          </div>
        </div>
      ) : null}
    </motion.section>
  );
}
