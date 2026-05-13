"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type { QuickBroadcastTemplate, QuickMessage } from "@/types/message";
import type { Database } from "@/types/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

export const quickBroadcasts: QuickBroadcastTemplate[] = [
  {
    kind: "finish",
    label: "Meeting at Finish Line",
    message: "Meeting at Finish Line",
    location: "Riverfront Plaza Finish",
  },
  {
    kind: "memorial_park",
    label: "Meeting at Memorial Park",
    message: "Meeting at Memorial Park",
    location: "Memorial Park",
  },
  {
    kind: "lunch",
    label: "Heading to Lunch",
    message: "Heading to Lunch",
    location: "Lunch stop",
  },
  {
    kind: "help_water",
    label: "Need Help/Water",
    message: "Need Help/Water",
    location: "Current family location",
  },
];

function fromRow(row: MessageRow): QuickMessage {
  return {
    id: row.id,
    author: row.author,
    message: row.message,
    location: row.location,
    kind: row.kind,
    createdAt: row.created_at,
  };
}

function optimisticMessage(template: QuickBroadcastTemplate, author: string): QuickMessage {
  return {
    id: `optimistic-${crypto.randomUUID()}`,
    author,
    message: template.message,
    location: template.location,
    kind: template.kind,
    createdAt: new Date().toISOString(),
    optimistic: true,
  };
}

function mergeMessage(message: QuickMessage, current: QuickMessage[]) {
  const withoutDuplicate = current.filter(
    (item) =>
      item.id !== message.id &&
      !(
        item.optimistic &&
        item.author === message.author &&
        item.message === message.message &&
        item.kind === message.kind
      ),
  );

  return [message, ...withoutDuplicate].slice(0, 20);
}

export function useQuickSync({
  onBroadcast,
}: {
  onBroadcast?: (message: QuickMessage) => void;
} = {}) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [messages, setMessages] = useState<QuickMessage[]>([]);
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

    async function loadMessages() {
      const { data, error: loadError } = await client
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!isMounted) {
        return;
      }

      if (loadError) {
        setError(loadError.message);
      } else {
        setMessages((data ?? []).map(fromRow));
      }

      setIsLoading(false);
    }

    loadMessages();

    const channel = client
      .channel("quick-sync-broadcasts", {
        config: {
          broadcast: {
            self: true,
          },
        },
      })
      .on("broadcast", { event: "quick-sync" }, ({ payload }) => {
        const incoming = payload as QuickMessage;
        setMessages((current) => mergeMessage(incoming, current));
        onBroadcast?.(incoming);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearStaleTimeout();
          setIsRealtimeStale(false);
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          markDisconnected();
        }

        if (status === "CHANNEL_ERROR") {
          setError("Quick Sync broadcast is not connected.");
        }
      });

    channelRef.current = channel;

    return () => {
      isMounted = false;
      clearStaleTimeout();
      channelRef.current = null;
      client.removeChannel(channel);
    };
  }, [onBroadcast, supabase]);

  const sendQuickBroadcast = useCallback(
    async (template: QuickBroadcastTemplate, author = "Family") => {
      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }

      const cleanAuthor = author.trim() || "Family";
      const optimistic = optimisticMessage(template, cleanAuthor);
      setMessages((current) => mergeMessage(optimistic, current));

      const { data, error: insertError } = await supabase
        .from("messages")
        .insert({
          author: cleanAuthor,
          message: template.message,
          location: template.location,
          kind: template.kind,
        })
        .select()
        .single();

      if (insertError) {
        setMessages((current) => current.filter((item) => item.id !== optimistic.id));
        throw insertError;
      }

      const saved = fromRow(data);
      setMessages((current) => mergeMessage(saved, current));

      await channelRef.current?.send({
        type: "broadcast",
        event: "quick-sync",
        payload: saved,
      });

      return saved;
    },
    [supabase],
  );

  return {
    error,
    isConfigured: Boolean(supabase),
    isLoading,
    isRealtimeStale,
    messages,
    sendQuickBroadcast,
  };
}
