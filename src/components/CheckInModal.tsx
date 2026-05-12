"use client";

import { useEffect, useState } from "react";
import type { CheckInInput } from "@/types/checkIn";

type ManualDraft = {
  name: string;
  note?: string;
};

type CheckInModalProps = {
  isConfigured: boolean;
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CheckInInput) => Promise<void>;
  onManualPick: (draft: ManualDraft) => void;
};

const savedNameKey = "ironmanben-family-name";

export function CheckInModal({
  isConfigured,
  isOpen,
  onClose,
  onCreate,
  onManualPick,
}: CheckInModalProps) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setName(window.localStorage.getItem(savedNameKey) ?? "");
    setNote("");
    setStatus(null);
    setIsSubmitting(false);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const trimmedName = name.trim();
  const trimmedNote = note.trim();
  const canSubmit = isConfigured && trimmedName.length > 0 && !isSubmitting;

  function rememberName() {
    window.localStorage.setItem(savedNameKey, trimmedName);
  }

  async function useGps() {
    if (!canSubmit) {
      return;
    }

    if (!navigator.geolocation) {
      setStatus("Location is not available in this browser.");
      return;
    }

    rememberName();
    setIsSubmitting(true);
    setStatus("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await onCreate({
            name: trimmedName,
            note: trimmedNote,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            source: "gps",
          });
          setStatus("Checked in.");
          window.setTimeout(onClose, 500);
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "Check-in failed.");
        } finally {
          setIsSubmitting(false);
        }
      },
      (error) => {
        setStatus(error.message || "Location permission was not granted.");
        setIsSubmitting(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 12000,
      },
    );
  }

  function startManualPick() {
    if (!canSubmit) {
      return;
    }

    rememberName();
    onManualPick({
      name: trimmedName,
      note: trimmedNote,
    });
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end bg-black/55 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <section className="w-full rounded-lg border border-white/10 bg-ink/[0.88] p-4 text-white shadow-2xl backdrop-blur-lg sm:max-w-md sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-surge">Family check-in</p>
            <h2 className="mt-1 text-3xl font-black">Check In Here</h2>
          </div>
          <button
            className="focus-ring rounded-md border border-white/20 px-3 py-2 text-sm font-black text-white"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>

        <p className="mt-3 rounded-md bg-white/10 p-3 text-sm font-bold leading-6 text-white/80">
          Share your current spot with the family.
        </p>

        {!isConfigured ? (
          <p className="mt-3 rounded-md bg-surge/20 p-3 text-sm font-bold text-white">
            Supabase is not configured yet. Add the environment variables before race day.
          </p>
        ) : null}

        <label className="mt-4 block text-sm font-black text-white" htmlFor="checkin-name">
          Name
        </label>
        <input
          id="checkin-name"
          className="mt-2 w-full rounded-md border border-white/15 bg-white px-3 py-3 text-base font-bold text-ink outline-none focus:border-river"
          autoComplete="name"
          maxLength={48}
          placeholder="Aunt Lisa"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <label className="mt-4 block text-sm font-black text-white" htmlFor="checkin-note">
          Note <span className="font-semibold text-white/55">optional</span>
        </label>
        <textarea
          id="checkin-note"
          className="mt-2 min-h-20 w-full rounded-md border border-white/15 bg-white px-3 py-3 text-base text-ink outline-none focus:border-river"
          maxLength={140}
          placeholder="By the big oak near Memorial Park"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            className="focus-ring min-h-16 rounded-md bg-river px-4 py-4 text-lg font-black text-white disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
            disabled={!canSubmit}
            type="button"
            onClick={useGps}
          >
            Check In Here
          </button>
          <button
            className="focus-ring min-h-12 rounded-md border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
            disabled={!canSubmit}
            type="button"
            onClick={startManualPick}
          >
            Use custom location
          </button>
        </div>

        {status ? <p className="mt-3 text-sm font-bold text-white/80">{status}</p> : null}
      </section>
    </div>
  );
}
