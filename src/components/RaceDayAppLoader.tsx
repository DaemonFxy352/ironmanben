"use client";

import dynamic from "next/dynamic";

const DynamicRaceDayApp = dynamic(
  () => import("@/components/RaceDayApp").then((module) => module.RaceDayApp),
  {
    ssr: false,
    loading: () => (
      <main className="min-h-dvh bg-ink text-white">
        <div className="flex min-h-dvh items-center justify-center p-6">
          <div className="w-full max-w-sm rounded-lg border border-white/15 bg-white/10 p-5 text-center backdrop-blur-lg">
            <p className="text-sm font-black uppercase text-surge">Loading map</p>
            <h1 className="mt-2 text-3xl font-black">Race HQ</h1>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-river" />
            </div>
          </div>
        </div>
      </main>
    ),
  },
);

export function RaceDayAppLoader() {
  return <DynamicRaceDayApp />;
}
