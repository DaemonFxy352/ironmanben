"use client";

import { useEffect, useState } from "react";
import { RACE_START_LABEL, raceStartMs } from "@/lib/raceSchedule";

const minuteMs = 60 * 1000;

function getNow() {
  return Date.now();
}

function splitDuration(totalMs: number) {
  const safeMs = Math.max(0, totalMs);
  const totalMinutes = Math.floor(safeMs / minuteMs);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes };
}

function twoDigits(value: number) {
  return value.toString().padStart(2, "0");
}

export function RaceHeader({
  isRealtimeStale = false,
  racePhase = "Race Day",
}: {
  isRealtimeStale?: boolean;
  racePhase?: string;
}) {
  const [now, setNow] = useState(getNow);
  const startMs = raceStartMs();
  const hasStarted = now >= startMs;
  const display = splitDuration(hasStarted ? now - startMs : startMs - now);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(getNow()), 15000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-[1400] h-[60px] max-h-[60px] border-b border-lime-300/35 bg-black text-white shadow-2xl">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between gap-3 px-3">
        <div className="min-w-0">
          <p className="truncate text-[0.65rem] font-black uppercase text-white/55">
            IRONMAN Jacksonville
          </p>
          <div className="mt-1 flex min-w-0 items-center gap-2">
            <p className="truncate text-xs font-bold text-white/70">{RACE_START_LABEL}</p>
            <div
              className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
              style={{
                background: "rgba(232,75,26,0.2)",
                border: "1px solid rgba(232,75,26,0.4)",
                color: "#f07050",
              }}
            >
              {racePhase}
            </div>
          </div>
        </div>

        {hasStarted ? (
          <div
            className={`flex shrink-0 items-center gap-2 rounded-xl border-2 bg-black px-3 py-2 text-right font-mono shadow-[0_0_22px_rgba(74,222,128,0.45)] ${
              isRealtimeStale ? "border-yellow-300" : "border-green-400"
            }`}
          >
            <span
              className={`h-3 w-3 rounded-full ${
                isRealtimeStale
                  ? "bg-yellow-300 shadow-[0_0_18px_rgba(253,224,71,0.9)]"
                  : "bg-lime-300 shadow-[0_0_18px_rgba(190,242,100,0.9)]"
              }`}
            />
            <div>
              <p
                className={`text-[0.65rem] font-black uppercase ${
                  isRealtimeStale ? "text-yellow-300" : "text-lime-300"
                }`}
              >
                {isRealtimeStale ? "Offline: Showing last known location." : "Race Live"}
              </p>
              <p className="text-xl font-black leading-none tracking-normal text-white">
                {display.days > 0 ? `${display.days}d ` : ""}
                {twoDigits(display.hours)}:{twoDigits(display.minutes)}
              </p>
            </div>
          </div>
        ) : (
          <div className="shrink-0 text-right font-mono">
            <p className="text-[0.65rem] font-black uppercase text-lime-300">Starts In</p>
            <p className="text-xl font-black leading-none tracking-normal text-white">
              {display.days}:{twoDigits(display.hours)}:{twoDigits(display.minutes)}
            </p>
            <p className="text-[0.58rem] font-bold uppercase text-white/45">D:HH:MM</p>
          </div>
        )}
      </div>
    </header>
  );
}
