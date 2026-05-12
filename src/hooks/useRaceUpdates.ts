"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { RaceUpdate, RaceUpdateInput } from "@/types/raceUpdate";
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

function optimisticUpdate(input: RaceUpdateInput): RaceUpdate {
  return {
    id: `optimistic-${crypto.randomUUID()}`,
    author: input.author.trim(),
    message: input.message.trim(),
    location: input.location?.trim() || null,
    type: input.type,
    createdAt: new Date().toISOString(),
    optimistic: true,
  };
}

export function useRaceUpdates() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [updates, setUpdates] = useState<RaceUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const client = supabase;
    let isMounted = true;

    async function loadUpdates() {
      const { data, error: loadError } = await client
        .from("race_updates")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!isMounted) {
        return;
      }

      if (loadError) {
        setError(loadError.message);
      } else {
        setUpdates((data ?? []).map(fromRow));
      }

      setIsLoading(false);
    }

    loadUpdates();

    const channel = client
      .channel("race-day-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "race_updates",
        },
        (payload) => {
          const incoming = fromRow(payload.new as RaceUpdateRow);
          setUpdates((current) => {
            const withoutOptimisticDuplicate = current.filter(
              (item) =>
                item.id !== incoming.id &&
                !(item.optimistic && item.author === incoming.author && item.message === incoming.message),
            );

            return [incoming, ...withoutOptimisticDuplicate].slice(0, 50);
          });
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          setError("Realtime updates are not connected.");
        }
      });

    return () => {
      isMounted = false;
      client.removeChannel(channel);
    };
  }, [supabase]);

  const postUpdate = useCallback(
    async (input: RaceUpdateInput) => {
      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }

      const optimistic = optimisticUpdate(input);
      setUpdates((current) => [optimistic, ...current].slice(0, 50));

      const { data, error: insertError } = await supabase
        .from("race_updates")
        .insert({
          author: input.author.trim(),
          message: input.message.trim(),
          location: input.location?.trim() || null,
          type: input.type,
        })
        .select()
        .single();

      if (insertError) {
        setUpdates((current) => current.filter((item) => item.id !== optimistic.id));
        throw insertError;
      }

      const saved = fromRow(data);
      setUpdates((current) => [
        saved,
        ...current.filter((item) => item.id !== optimistic.id && item.id !== saved.id),
      ]);

      return saved;
    },
    [supabase],
  );

  return {
    error,
    isConfigured: Boolean(supabase),
    isLoading,
    postUpdate,
    updates,
  };
}
