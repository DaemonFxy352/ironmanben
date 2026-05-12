"use client";

import dynamic from "next/dynamic";

const DynamicSpectatorMap = dynamic(
  () => import("@/components/SpectatorMap").then((module) => module.SpectatorMap),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
        <div className="h-[62vh] min-h-[420px] animate-pulse rounded-md bg-paper" />
      </div>
    ),
  },
);

export function SpectatorMapLoader() {
  return <DynamicSpectatorMap />;
}
