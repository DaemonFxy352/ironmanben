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

    const timeout = window.setTimeout(onDismiss, 2500);
    return () => window.clearTimeout(timeout);
  }, [onDismiss, visible]);

  return (
    <div
      className="pointer-events-none fixed left-1/2 top-16 z-[2400] whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300"
      style={{
        background: "rgba(74,222,128,0.15)",
        border: "1px solid rgba(74,222,128,0.35)",
        color: "#4ade80",
        opacity: visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${visible ? "0" : "-8px"})`,
      }}
    >
      {message}
    </div>
  );
}
