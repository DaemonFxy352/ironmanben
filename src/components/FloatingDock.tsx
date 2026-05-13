"use client";

import { useState } from "react";

type FloatingDockProps = {
  isOffline?: boolean;
  isRecentering?: boolean;
  onCheckIn: () => void;
  onRecenter: () => void;
  onSawBen: () => void;
};

function pulse() {
  if ("vibrate" in navigator) {
    navigator.vibrate(50);
  }
}

export function FloatingDock({
  isOffline = false,
  isRecentering = false,
  onCheckIn,
  onRecenter,
  onSawBen,
}: FloatingDockProps) {
  const [isSawBenLoading, setIsSawBenLoading] = useState(false);

  function handleSawBen() {
    pulse();
    setIsSawBenLoading(true);
    window.setTimeout(onSawBen, 120);
    window.setTimeout(() => setIsSawBenLoading(false), 700);
  }

  return (
    <div
      className="fixed left-3 right-3 z-[1400] mx-auto max-w-xl rounded-full border border-white/10 bg-zinc-950/80 p-2 shadow-2xl backdrop-blur-xl"
      style={{ bottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}
    >
      {isOffline ? (
        <div className="mb-1 flex items-center justify-center gap-1.5 font-mono text-[0.62rem] font-black uppercase tracking-wide text-red-300">
          <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
          OFFLINE
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <button
          className="btn-primary focus-ring flex-1 rounded-full border border-white/10 bg-lime-300 px-4 py-3 text-sm font-black text-black transition-all active:scale-95"
          type="button"
          onClick={() => {
            pulse();
            onCheckIn();
          }}
        >
          Check In
        </button>
        <button
          className="btn-primary focus-ring flex-1 rounded-full border border-white/10 bg-white px-4 py-3 text-sm font-black text-zinc-950 transition-all active:scale-95"
          type="button"
          onClick={handleSawBen}
        >
          <span className="inline-flex items-center justify-center gap-2">
            {isSawBenLoading ? (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950/25 border-t-zinc-950"
              />
            ) : null}
            Saw Ben
          </span>
        </button>
        <button
          aria-label="Recenter map"
          className="focus-ring flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white shadow-2xl transition-all active:scale-95 disabled:opacity-60"
          disabled={isRecentering}
          title="Recenter"
          type="button"
          onClick={() => {
            pulse();
            onRecenter();
          }}
        >
          {isRecentering ? (
            <span
              aria-hidden="true"
              className="h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-lime-300"
            />
          ) : (
            <span aria-hidden="true" className="crosshair-icon scale-75" />
          )}
        </button>
      </div>
    </div>
  );
}
