"use client";

import { useEffect, useMemo, useState } from "react";
import { RACE_SEGMENTS, addRaceMinutes, raceStartMs } from "@/lib/raceSchedule";
import type { RaceUpdate } from "@/types/raceUpdate";

const minuteMs = 60 * 1000;
const bikeDistanceKm = 180;

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getSegmentState(now: number, startOffsetMinutes: number, durationMinutes: number) {
  const start = raceStartMs() + startOffsetMinutes * minuteMs;
  const end = start + durationMinutes * minuteMs;

  if (now < start) {
    return { label: "Next", progress: 0, status: "future" as const };
  }

  if (now >= end) {
    return { label: "Done", progress: 100, status: "done" as const };
  }

  return {
    label: "Active",
    progress: Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100)),
    status: "active" as const,
  };
}

function formatHours(minutes: number) {
  if (minutes >= 60) {
    return `${Math.max(0.1, minutes / 60).toFixed(1)} hours`;
  }

  return `${Math.max(1, Math.round(minutes))} minutes`;
}

function getBikePrediction(now: number) {
  const bike = RACE_SEGMENTS.find((segment) => segment.id === "bike");

  if (!bike) {
    return null;
  }

  const bikeStart = raceStartMs() + bike.startOffsetMinutes * minuteMs;
  const elapsedMinutes = Math.max(1, (now - bikeStart) / minuteMs);
  const modelProgress = Math.min(0.98, Math.max(0.08, elapsedMinutes / bike.durationMinutes));
  const estimatedDistanceKm = Math.min(bikeDistanceKm - 1, bikeDistanceKm * modelProgress);
  const paceMinutesPerKm = elapsedMinutes / estimatedDistanceKm;
  const remainingMinutes = Math.max(0, (bikeDistanceKm - estimatedDistanceKm) * paceMinutesPerKm);
  const estimatedArrivalT2 = new Date(now + remainingMinutes * minuteMs);

  return {
    estimatedArrivalT2,
    hoursToT2: formatHours(remainingMinutes),
    paceKmh: estimatedDistanceKm / (Math.max(elapsedMinutes, 1) / 60),
  };
}

type RaceTimelineProps = {
  compact?: boolean;
  latestBenUpdate?: RaceUpdate;
  onToggleDoneSegments?: () => void;
  showDoneSegments?: boolean;
};

export function RaceTimeline({
  compact = false,
  latestBenUpdate,
  onToggleDoneSegments,
  showDoneSegments = false,
}: RaceTimelineProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const rows = useMemo(
    () =>
      RACE_SEGMENTS.map((segment) => ({
        ...segment,
        estimatedStart: formatClock(addRaceMinutes(segment.startOffsetMinutes)),
        state: getSegmentState(now, segment.startOffsetMinutes, segment.durationMinutes),
      })),
    [now],
  );
  const latestText = `${latestBenUpdate?.location ?? ""} ${latestBenUpdate?.message ?? ""}`.toLowerCase();
  const hasBikeSignal =
    latestText.includes("bike") || latestText.includes("ponte") || latestText.includes("a1a");
  const isBikeActive = rows.some((segment) => segment.id === "bike" && segment.state.status === "active");
  const bikePrediction = isBikeActive || hasBikeSignal ? getBikePrediction(now) : null;
  const currentSegment =
    rows.find((segment) => segment.state.status === "active") ??
    rows.find((segment) => segment.state.status === "future") ??
    rows[rows.length - 1];
  const doneSegments = rows.filter((segment) => segment.state.status === "done");
  const doneCount = doneSegments.length;
  const visibleRows = showDoneSegments
    ? rows
    : rows.filter((segment) => segment.state.status !== "done");
  const doneSummary =
    doneSegments.length > 0
      ? `✓ ${doneSegments.map((segment) => segment.name).join(" & ")} Finished`
      : null;

  if (compact) {
    return (
      <div className="min-w-0 flex-1 font-mono">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-xs font-black uppercase text-white">
            {currentSegment.name} / {currentSegment.distance}
          </p>
          <p className="shrink-0 text-xs font-black text-lime-300">
            {Math.round(currentSegment.state.progress)}%
          </p>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-lime-300"
            style={{ width: `${currentSegment.state.progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-white/10 bg-zinc-950/80 p-3 text-white shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-black uppercase text-lime-300">Pit Wall</p>
          <h2 className="text-lg font-black leading-tight">What&apos;s Next</h2>
        </div>
        {doneCount > 0 && onToggleDoneSegments ? (
          <button
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 font-mono text-[0.68rem] font-black uppercase text-white/70 transition-all active:scale-95"
            type="button"
            onClick={onToggleDoneSegments}
          >
            {showDoneSegments ? "Hide Done" : `Show Done (${doneCount})`}
          </button>
        ) : (
          <p className="font-mono text-[0.68rem] font-black uppercase text-white/50">ETA model</p>
        )}
      </div>

      {bikePrediction ? (
        <div className="mt-3 rounded-xl border-2 border-lime-300 bg-zinc-950/80 p-3 shadow-[0_0_22px_rgba(190,242,100,0.26)] backdrop-blur-xl">
          <p className="text-[0.68rem] font-black uppercase text-lime-300">Family Action</p>
          <p className="mt-1 text-sm font-black leading-5 text-white">
            Ben is at Ponte Vedra. Predicted back in Jacksonville in{" "}
            <span className="font-mono font-black text-lime-300">~{bikePrediction.hoursToT2}</span>.
            Time for lunch/nap.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 font-mono">
            <div className="rounded-lg bg-white/10 p-2">
              <p className="text-[0.62rem] font-black uppercase text-white/45">ETA T2</p>
              <p className="text-lg font-black text-white">
                {formatClock(bikePrediction.estimatedArrivalT2)}
              </p>
            </div>
            <div className="rounded-lg bg-white/10 p-2">
              <p className="text-[0.62rem] font-black uppercase text-white/45">Bike Pace</p>
              <p className="text-lg font-black text-white">{bikePrediction.paceKmh.toFixed(1)} kph</p>
            </div>
          </div>
        </div>
      ) : null}

      <ol className="mt-3 space-y-2">
        {!showDoneSegments && doneSummary ? (
          <li className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm font-black text-white/65">
            {doneSummary}
          </li>
        ) : null}

        {visibleRows.map((segment) => (
          <li
            key={segment.id}
            className={`relative rounded-lg border p-3 transition-colors ${
              segment.state.status === "active"
                ? "border-lime-300/70 bg-lime-300/10"
                : segment.state.status === "done"
                  ? "border-white/10 bg-white/5 text-white/55"
                  : "border-white/15 bg-white/[0.07]"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-black ${
                  segment.state.status === "active"
                    ? "border-lime-300 bg-lime-300 text-black"
                    : "border-white/20 bg-black text-white"
                }`}
              >
                {segment.id.toUpperCase().slice(0, 1)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-mono text-base font-black uppercase tracking-normal">
                      {segment.name}
                    </h3>
                    <p className="font-mono text-xs font-black text-white/75">
                      <span className="font-black">{segment.distance}</span> /{" "}
                      <span className="font-black">{segment.pace}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right font-mono">
                    <p className="text-[0.62rem] font-black uppercase text-white/45">
                      Estimated Start
                    </p>
                    <p className="text-sm font-black text-white">{segment.estimatedStart}</p>
                    <p className="text-[0.62rem] font-black uppercase text-lime-300">
                      {segment.state.label}
                    </p>
                  </div>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${
                      segment.state.status === "active" ? "bg-lime-300" : "bg-white/35"
                    }`}
                    style={{ width: `${segment.state.progress}%` }}
                  />
                </div>

                {segment.familyWindow ? (
                  <p className="mt-2 rounded-lg border border-lime-300/25 bg-black/35 p-2 text-xs font-bold leading-5 text-lime-100">
                    {segment.familyWindow}
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
