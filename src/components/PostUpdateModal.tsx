"use client";

import { useEffect, useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import { CHEER_LOCATIONS } from "@/lib/raceLocations";
import type { RaceUpdateInput, RaceUpdateType } from "@/types/raceUpdate";

type PostUpdateModalProps = {
  isConfigured: boolean;
  isOpen: boolean;
  onClose: () => void;
  onPost: (input: RaceUpdateInput) => Promise<void>;
};

const crewNameKey = "crew_name";
const legacyNameKey = "ironmanben-family-name";
const updateTypes: Array<{ value: RaceUpdateType; label: string }> = [
  { value: "ben", label: "Saw Ben" },
  { value: "parking", label: "Parking" },
  { value: "food", label: "Food" },
  { value: "meetup", label: "Meetup" },
  { value: "help", label: "Need Help" },
  { value: "general", label: "General" },
];

function savedCrewName() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(crewNameKey) || window.localStorage.getItem(legacyNameKey) || "";
}

function rememberCrewName(name: string) {
  window.localStorage.setItem(crewNameKey, name);
  window.localStorage.setItem(legacyNameKey, name);
}

function typeLabel(type: RaceUpdateType) {
  return updateTypes.find((item) => item.value === type)?.label ?? "Update";
}

export function PostUpdateModal({ isConfigured, isOpen, onClose, onPost }: PostUpdateModalProps) {
  const [author, setAuthor] = useState(savedCrewName);
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState("");
  const [type, setType] = useState<RaceUpdateType>("ben");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setAuthor(savedCrewName());
    setNote("");
    setSelected("");
    setType("ben");
    setStatus(null);
    setIsSubmitting(false);
  }, [isOpen]);

  const canSubmit =
    isConfigured && author.trim().length > 0 && type.length > 0 && selected.length > 0 && !isSubmitting;

  async function submit() {
    if (!canSubmit) {
      return;
    }

    const cleanAuthor = author.trim();
    const cleanNote = note.trim();
    const label = typeLabel(type);

    setIsSubmitting(true);
    setStatus("Posting...");

    try {
      if (window.localStorage.getItem("guest_name") === "Guest") {
        setStatus("Enter the crew PIN to post updates.");
        return;
      }

      rememberCrewName(cleanAuthor);
      await onPost({
        author: cleanAuthor,
        message: cleanNote ? `${label}: ${selected}. ${cleanNote}` : `${label}: ${selected}`,
        location: selected,
        type,
      });

      if (type === "ben") {
        fetch("/api/notify/sighting", {
          body: JSON.stringify({
            note: cleanNote || null,
            spottedAt: selected,
            spottedBy: cleanAuthor,
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }).catch(console.error);
      }

      setStatus("Posted.");
      onClose();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={type === "ben" ? "Saw Ben!" : "Post Update"}
      subtitle="Tap the category and location"
    >
      <div className="mb-3">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/35">
          Name
        </label>
        <input
          className="w-full rounded-xl border border-white/15 bg-white/[0.07] p-3 text-sm text-white outline-none focus:border-white/35"
          style={{ minHeight: "48px" }}
          type="text"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
        />
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {updateTypes.map((item) => (
          <button
            key={item.value}
            className="px-3 py-3 text-sm font-black transition-all active:scale-95"
            style={{
              background:
                type === item.value ? "rgba(232,75,26,0.25)" : "rgba(255,255,255,0.06)",
              border:
                type === item.value
                  ? "1px solid rgba(232,75,26,0.6)"
                  : "0.5px solid rgba(255,255,255,0.12)",
              color: type === item.value ? "#f07050" : "rgba(255,255,255,0.72)",
            }}
            type="button"
            onClick={() => setType(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {type ? (
        <>
          <div className="mb-3 grid grid-cols-2 gap-2">
            {CHEER_LOCATIONS.filter((location) => location.name !== "Other").map((location) => (
              <button
                key={location.name}
                className="text-left transition-all active:scale-95"
                style={{
                  minHeight: "64px",
                  padding: "1rem",
                  borderRadius: "0.75rem",
                  background:
                    selected === location.name ? "rgba(232,75,26,0.25)" : "rgba(232,75,26,0.08)",
                  border:
                    selected === location.name
                      ? "1px solid rgba(232,75,26,0.6)"
                      : "0.5px solid rgba(232,75,26,0.2)",
                }}
                type="button"
                onClick={() => setSelected(location.name)}
              >
                <span className="block text-sm font-semibold text-white">{location.name}</span>
                <span className="mt-0.5 block text-xs text-white/40">{location.description}</span>
              </button>
            ))}
          </div>

          <input
            className="mb-3 w-full rounded-xl border border-white/15 bg-white/[0.07] p-3 text-sm text-white outline-none focus:border-white/35"
            placeholder="Add a note (optional)"
            style={{ minHeight: "48px" }}
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </>
      ) : null}

      <button
        className="btn-primary w-full rounded-xl px-4 py-4 text-base font-bold text-white transition-opacity active:scale-95"
        disabled={!canSubmit}
        style={{
          background: "#e84b1a",
          opacity: canSubmit ? 1 : 0.4,
        }}
        type="button"
        onClick={submit}
      >
        {isSubmitting ? "Posting..." : type === "ben" ? "Post sighting" : "Post update"}
      </button>

      {status ? <p className="mt-3 text-sm font-bold text-white/70">{status}</p> : null}
    </BottomSheet>
  );
}
