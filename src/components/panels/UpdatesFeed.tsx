"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import type { RaceUpdate, RaceUpdateType } from "@/types/raceUpdate";

function formatTime(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function useRelativeTime(dateStr: string) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    function update() {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);

      if (diff < 1) {
        setLabel("just now");
      } else if (diff < 60) {
        setLabel(`${diff} min ago`);
      } else {
        setLabel(`${Math.floor(diff / 60)}h ${diff % 60}m ago`);
      }
    }

    update();
    const interval = window.setInterval(update, 30000);
    return () => window.clearInterval(interval);
  }, [dateStr]);

  return label;
}

const UPDATE_TYPE_STYLES: Record<
  RaceUpdateType,
  { dot: string; label: string }
> = {
  ben: { dot: "bg-accent-warm", label: "Ben Sighting" },
  parking: { dot: "bg-primary", label: "Parking" },
  food: { dot: "bg-success", label: "Food" },
  meetup: { dot: "bg-primary", label: "Meetup" },
  help: { dot: "bg-danger", label: "Help Needed" },
  general: { dot: "bg-muted", label: "Update" },
};

interface UpdateItemProps {
  update: RaceUpdate;
}

const DOT_COLOR_MAP: Record<string, string> = {
  "bg-accent-warm": "#FF6B2B",
  "bg-primary": "#ADFF45",
  "bg-success": "#16A34A",
  "bg-danger": "#DC2626",
  "bg-muted": "#6B7280",
};

function UpdateItem({ update }: UpdateItemProps) {
  const relativeTime = useRelativeTime(update.createdAt);
  const style = UPDATE_TYPE_STYLES[update.type];
  const borderColor = DOT_COLOR_MAP[style.dot] || "#6B7280";

  return (
    <Card className="relative border-l-4" style={{ borderLeftColor }}>
      <div className="flex items-start gap-3">
        {/* Colored dot indicator */}
        <div className={`w-3 h-3 rounded-full ${style.dot} mt-1.5 shrink-0`} />

        <div className="flex-1 min-w-0">
          {/* Type label */}
          <div className="text-xs font-bold uppercase tracking-wide text-muted mb-1">
            {style.label}
          </div>

          {/* Author and message */}
          <div className="font-bold text-primary-text mb-1">{update.author}</div>
          <p className="text-base text-primary-text leading-snug">{update.message}</p>

          {/* Location and time */}
          <div className="flex items-center gap-2 mt-2 text-sm text-muted">
            {update.location && (
              <>
                <span className="font-semibold">{update.location}</span>
                <span>•</span>
              </>
            )}
            <span>{relativeTime}</span>
            {update.optimistic && (
              <>
                <span>•</span>
                <span className="text-primary font-semibold">sending</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

interface UpdatesFeedProps {
  updates: RaceUpdate[];
}

export function UpdatesFeed({ updates }: UpdatesFeedProps) {
  // Show most recent 15 updates
  const recentUpdates = updates.slice(0, 15);

  if (recentUpdates.length === 0) {
    return (
      <Card>
        <p className="text-center text-muted py-4">No updates yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {recentUpdates.map((update) => (
        <UpdateItem key={update.id} update={update} />
      ))}
    </div>
  );
}
