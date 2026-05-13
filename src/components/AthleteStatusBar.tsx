"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { RaceUpdate } from "@/types/raceUpdate";
import type { Database } from "@/types/supabase";

type RaceUpdateRow = Database["public"]["Tables"]["race_updates"]["Row"];

function fromRow(row: RaceUpdateRow): RaceUpdate {
  return {
    id: row.id,
    author: row.author,
    message: row.message,
    location: row.location,
    type: row.type,
    createdAt: row.created_at,
  };
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);

  if (diff < 1) {
    return "just now";
  }

  if (diff === 1) {
    return "1 min ago";
  }

  if (diff < 60) {
    return `${diff} min ago`;
  }

  return `${Math.floor(diff / 60)}h ago`;
}

export default function AthleteStatusBar({
  isRealtimeStale,
  latestBenUpdate,
}: {
  isRealtimeStale?: boolean;
  latestBenUpdate?: RaceUpdate;
}) {
  const [latest, setLatest] = useState<RaceUpdate | null>(latestBenUpdate ?? null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (latestBenUpdate) {
      setLatest(latestBenUpdate);
    }
  }, [latestBenUpdate]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return;
    }

    let isMounted = true;

    supabase
      .from("race_updates")
      .select("*")
      .eq("type", "ben")
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (isMounted && data?.[0]) {
          setLatest(fromRow(data[0]));
        }
      });

    const channel = supabase
      .channel("athlete-status")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "race_updates", filter: "type=eq.ben" },
        (payload) => {
          setLatest(fromRow(payload.new as RaceUpdateRow));
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="fixed left-0 right-0 top-[60px] z-[1350] bg-zinc-950 px-3 pb-2 pt-2">
      <div className="mx-auto flex max-w-5xl items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#e84b1a]/50 bg-gradient-to-br from-[#e84b1a] to-[#c73410] text-base font-bold text-white">
          B
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {latest ? `Last seen: ${latest.location || latest.message}` : "Waiting for first sighting"}
          </p>
          <p className="mt-0.5 truncate text-xs text-white/45">
            {latest
              ? `Spotted by ${latest.author} · ${timeAgo(latest.createdAt)}`
              : "Post a sighting when you see him"}
            <span className="sr-only">{now}</span>
          </p>
        </div>
        <div
          className="h-2 w-2 shrink-0 rounded-full animate-pulse"
          style={{ background: isRealtimeStale ? "#fde047" : "#4ade80" }}
        />
      </div>
    </div>
  );
}
