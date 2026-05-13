"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type BottomSheetProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  subtitle?: string;
  title: string;
};

export default function BottomSheet({
  children,
  isOpen,
  onClose,
  subtitle,
  title,
}: BottomSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("sheet-open");
    } else {
      document.body.classList.remove("sheet-open");
    }

    return () => {
      document.body.classList.remove("sheet-open");
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[2000] flex items-end bg-black/60"
      onClick={(event) => {
        if (event.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      <div
        className="scroll-smooth-ios max-h-[88dvh] w-full rounded-t-3xl bg-[#111927] p-4 pb-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex justify-center">
          <div className="h-1 w-9 rounded-full bg-white/20" />
        </div>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-white/40">{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}
