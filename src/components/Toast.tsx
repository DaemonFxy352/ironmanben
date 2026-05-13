"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string;
  onDismiss: () => void;
  visible: boolean;
};

export default function Toast({ message, onDismiss, visible }: ToastProps) {
  useEffect(() => {
    if (!visible) {
      return;
    }

    const timeout = window.setTimeout(onDismiss, 2000);
    return () => window.clearTimeout(timeout);
  }, [onDismiss, visible]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed left-1/2 top-20 z-[2400] -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-200"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-xl bg-success px-5 py-3 shadow-lg">
        <div className="flex items-center gap-2 text-base font-bold text-white">
          <span aria-hidden="true">✓</span>
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}
