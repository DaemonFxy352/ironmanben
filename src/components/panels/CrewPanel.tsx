"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import type { CheckIn } from "@/types/checkIn";

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

function getPersonColor(name: string) {
  // Use only the 4 approved accent colors from the design system
  const colors = [
    "#16A34A", // success green
    "#FF6B2B", // accent-warm orange
    "#DC2626", // danger red
    "#ADFF45", // primary lime (but we'll darken for contrast on white bg)
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const color = colors[Math.abs(hash) % colors.length];

  // Darken lime green for better contrast with white text
  if (color === "#ADFF45") {
    return "#7CB342"; // Darker lime for readability
  }

  return color;
}

interface CrewMemberProps {
  checkIn: CheckIn;
}

function CrewMember({ checkIn }: CrewMemberProps) {
  const relativeTime = useRelativeTime(checkIn.createdAt);
  const color = getPersonColor(checkIn.name);
  const initial = checkIn.name.trim().slice(0, 1).toUpperCase();

  return (
    <Card>
      <div className="flex items-start gap-3">
        {/* Avatar circle with initial */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
          style={{ backgroundColor: color }}
        >
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name */}
          <div className="font-bold text-primary-text">{checkIn.name}</div>

          {/* Status/note */}
          <p className="text-sm text-muted mt-1">
            {checkIn.note || "Checked in on the map"}
          </p>

          {/* Time and source */}
          <div className="flex items-center gap-2 mt-2 text-sm text-muted">
            <span>{relativeTime}</span>
            <span>•</span>
            <span className="capitalize">{checkIn.source === "gps" ? "GPS" : "Custom pin"}</span>
            {checkIn.optimistic && (
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

interface CrewPanelProps {
  checkIns: CheckIn[];
}

export function CrewPanel({ checkIns }: CrewPanelProps) {
  // Filter to recent check-ins (last 6 hours)
  const sixHours = 6 * 60 * 60 * 1000;
  const recentCheckIns = checkIns.filter(
    (checkIn) => Date.now() - new Date(checkIn.createdAt).getTime() <= sixHours
  );

  // Show most recent 10 crew members
  const displayCheckIns = (recentCheckIns.length > 0 ? recentCheckIns : checkIns).slice(0, 10);

  if (displayCheckIns.length === 0) {
    return (
      <Card>
        <p className="text-center text-muted py-4">No crew check-ins yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="px-1">
        <h3 className="text-sm font-bold text-muted uppercase tracking-wide">
          Family Positions
        </h3>
        <p className="text-sm text-muted mt-1">
          {displayCheckIns.length} crew member{displayCheckIns.length !== 1 ? "s" : ""} checked in
        </p>
      </div>

      {displayCheckIns.map((checkIn) => (
        <CrewMember key={checkIn.id} checkIn={checkIn} />
      ))}
    </div>
  );
}
