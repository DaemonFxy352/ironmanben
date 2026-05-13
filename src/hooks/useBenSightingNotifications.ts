"use client";

import { useEffect, useRef } from "react";
import type { RaceUpdate } from "@/types/raceUpdate";

async function getRegistration() {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
    return await navigator.serviceWorker.register("/ben-sightings-sw.js");
  } catch {
    return null;
  }
}

async function showBenSighting(update: RaceUpdate) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const registration = await getRegistration();
  const body = update.location ? `${update.location}: ${update.message}` : update.message;

  if (registration) {
    await registration.showNotification("Ben sighting", {
      body,
      tag: `ben-sighting-${update.id}`,
      data: {
        url: "/",
      },
    });
    return;
  }

  new Notification("Ben sighting", {
    body,
    tag: `ben-sighting-${update.id}`,
  });
}

export function useBenSightingNotifications({
  enabled,
  updates,
}: {
  enabled: boolean;
  updates: RaceUpdate[];
}) {
  const knownIdsRef = useRef<Set<string>>(new Set());
  const hasPrimedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !("Notification" in window)) {
      return;
    }

    getRegistration();

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const benUpdates = updates.filter((update) => update.type === "ben" && !update.optimistic);

    if (!hasPrimedRef.current) {
      benUpdates.forEach((update) => knownIdsRef.current.add(update.id));
      hasPrimedRef.current = true;
      return;
    }

    const incoming = benUpdates.find((update) => !knownIdsRef.current.has(update.id));

    if (!incoming) {
      return;
    }

    knownIdsRef.current.add(incoming.id);
    showBenSighting(incoming);
  }, [enabled, updates]);
}
