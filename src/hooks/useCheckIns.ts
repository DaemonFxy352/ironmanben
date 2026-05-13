"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { CheckIn, CheckInInput } from "@/types/checkIn";
import type { Database } from "@/types/supabase";

type CheckInRow = Database["public"]["Tables"]["check_ins"]["Row"];

function fromRow(row: CheckInRow): CheckIn {
  return {
    id: row.id,
    name: row.name,
    note: row.note,
    lat: Number(row.lat),
    lng: Number(row.lng),
    createdAt: row.created_at,
    source: row.source,
  };
}

function optimisticCheckIn(input: CheckInInput): CheckIn {
  return {
    id: `optimistic-${crypto.randomUUID()}`,
    name: input.name.trim(),
    note: input.note?.trim() || null,
    lat: input.lat,
    lng: input.lng,
    createdAt: new Date().toISOString(),
    source: input.source,
    optimistic: true,
  };
}

export function useCheckIns() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [isRealtimeStale, setIsRealtimeStale] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const client = supabase;
    let isMounted = true;
    let staleTimeout: number | null = null;

    function clearStaleTimeout() {
      if (staleTimeout) {
        window.clearTimeout(staleTimeout);
        staleTimeout = null;
      }
    }

    function markDisconnected() {
      clearStaleTimeout();
      staleTimeout = window.setTimeout(() => {
        if (isMounted) {
          setIsRealtimeStale(true);
        }
      }, 10000);
    }

    async function loadCheckIns() {
      const { data, error: loadError } = await client
        .from("check_ins")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!isMounted) {
        return;
      }

      if (loadError) {
        setError(loadError.message);
      } else {
        setCheckIns((data ?? []).map(fromRow));
      }

      setIsLoading(false);
    }

    loadCheckIns();

    const channel = client
      .channel("race-day-check-ins")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "check_ins",
        },
        (payload) => {
          const incoming = fromRow(payload.new as CheckInRow);
          setCheckIns((current) => {
            const withoutOptimisticDuplicate = current.filter(
              (item) =>
                item.id !== incoming.id &&
                !(
                  item.optimistic &&
                  item.name === incoming.name &&
                  Math.abs(item.lat - incoming.lat) < 0.00001 &&
                  Math.abs(item.lng - incoming.lng) < 0.00001
                ),
            );

            return [incoming, ...withoutOptimisticDuplicate].slice(0, 100);
          });
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearStaleTimeout();
          setIsRealtimeStale(false);
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          markDisconnected();
        }

        if (status === "CHANNEL_ERROR") {
          setError("Realtime check-ins are not connected.");
        }
      });

    return () => {
      isMounted = false;
      clearStaleTimeout();
      client.removeChannel(channel);
    };
  }, [supabase]);

  const createCheckIn = useCallback(
    async (input: CheckInInput) => {
      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }

      const optimistic = optimisticCheckIn(input);
      setCheckIns((current) => [optimistic, ...current].slice(0, 100));

      const { data, error: insertError } = await supabase
        .from("check_ins")
        .insert({
          name: input.name.trim(),
          note: input.note?.trim() || null,
          lat: input.lat,
          lng: input.lng,
          source: input.source,
        })
        .select()
        .single();

      if (insertError) {
        setCheckIns((current) => current.filter((item) => item.id !== optimistic.id));
        throw insertError;
      }

      const saved = fromRow(data);
      setCheckIns((current) => [
        saved,
        ...current.filter((item) => item.id !== optimistic.id && item.id !== saved.id),
      ]);

      return saved;
    },
    [supabase],
  );

  return {
    checkIns,
    createCheckIn,
    error,
    isConfigured: Boolean(supabase),
    isLoading,
    isRealtimeStale,
  };
}
