"use client";

import { useEffect, useState } from "react";
import type { RaceUpdate, RaceUpdateType } from "@/types/raceUpdate";

function useRelativeTime(dateStr: string) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    function update() {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
      if (diff < 1) setLabel("just now");
      else if (diff < 60) setLabel(`${diff} min ago`);
      else setLabel(`${Math.floor(diff / 60)}h ${diff % 60}m ago`);
    }
    update();
    const interval = window.setInterval(update, 30000);
    return () => window.clearInterval(interval);
  }, [dateStr]);

  return label;
}

const TYPE_CONFIG: Record<RaceUpdateType, { color: string; label: string }> = {
  ben:     { color: "#FF6B2B", label: "Ben Sighting" },
  parking: { color: "#ADFF45", label: "Parking" },
  food:    { color: "#16A34A", label: "Food" },
  meetup:  { color: "#ADFF45", label: "Meetup" },
  help:    { color: "#DC2626", label: "Help Needed" },
  general: { color: "#6B7280", label: "Update" },
};

function UpdateItem({ update }: { update: RaceUpdate }) {
  const relativeTime = useRelativeTime(update.createdAt);
  const { color, label } = TYPE_CONFIG[update.type];

  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-3 h-3 rounded-full mt-1.5 shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">
            {label}
          </div>
          <div className="font-bold text-gray-900 mb-1">{update.author}</div>
          <p className="text-base text-gray-800 leading-snug">{update.message}</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
            {update.location && (
              <>
                <span className="font-semibold">{update.location}</span>
                <span>·</span>
              </>
            )}
            <span>{relativeTime}</span>
            {update.optimistic && (
              <>
                <span>·</span>
                <span className="text-lime-500 font-semibold">sending…</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function UpdatesFeed({ updates }: { updates: RaceUpdate[] }) {
  const recent = updates.slice(0, 15);

  if (recent.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center text-gray-400">
        No updates yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recent.map((update) => (
        <UpdateItem key={update.id} update={update} />
      ))}
    </div>
  );
}