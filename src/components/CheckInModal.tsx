"use client";

import { useEffect, useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import { CHEER_LOCATIONS, getRaceLocation } from "@/lib/raceLocations";
import { formatPhoneE164 } from "@/lib/sms";
import { getSupabaseClient } from "@/lib/supabase";
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
  phoneNumber?: string | null;
};

const crewNameKey = "crew_name";
const legacyNameKey = "ironmanben-family-name";

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

export function CheckInModal({
  isConfigured,
  isOpen,
  onClose,
  onCreate,
  phoneNumber,
}: CheckInModalProps) {
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [name, setName] = useState(savedCrewName);
  const [selectedLoc, setSelectedLoc] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [wantsSMS, setWantsSMS] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setAlreadySubscribed(window.localStorage.getItem("sms_subscribed") === "true");
    setName(savedCrewName());
    setSelectedLoc("");
    setStatus(null);
    setWantsSMS(false);
    setIsSubmitting(false);
  }, [isOpen]);

  const trimmedName = name.trim();
  const selected = selectedLoc ? getRaceLocation(selectedLoc) : null;
  const canSubmit =
    isConfigured &&
    trimmedName.length > 0 &&
    Boolean(selected?.coordinates) &&
    !isSubmitting;

  async function submit() {
    if (!canSubmit || !selected?.coordinates) {
      return;
    }

    setIsSubmitting(true);
    setStatus("Checking in...");

    try {
      if (window.localStorage.getItem("guest_name") === "Guest") {
        setStatus("Enter the crew PIN to check in.");
        return;
      }

      rememberCrewName(trimmedName);
      await onCreate({
        name: trimmedName,
        note: selected.name,
        lat: selected.coordinates.lat,
        lng: selected.coordinates.lng,
        source: "manual",
      });

      if (wantsSMS && phoneNumber && !alreadySubscribed) {
        const supabase = getSupabaseClient();

        if (supabase) {
          const { error } = await supabase.from("notification_subscribers").upsert(
            {
              display_name: trimmedName,
              is_active: true,
              notify_crew: false,
              notify_finish: true,
              notify_meetup: true,
              notify_sightings: true,
              phone_e164: formatPhoneE164(phoneNumber),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "phone_e164" },
          );

          if (!error) {
            window.localStorage.setItem("sms_subscribed", "true");
            window.localStorage.setItem("sms_phone", phoneNumber);
          }
        }
      }

      setStatus("Checked in.");
      onClose();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Check-in failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="I'm at..."
      subtitle="Let the crew know where you are"
    >
      <div className="mb-3">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/35">
          Your name
        </label>
        <input
          className="w-full rounded-xl border border-white/15 bg-white/[0.07] p-3 text-sm text-white outline-none focus:border-white/35"
          style={{ minHeight: "48px" }}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

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
                selectedLoc === location.name ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
              border:
                selectedLoc === location.name
                  ? "1px solid rgba(255,255,255,0.3)"
                  : "0.5px solid rgba(255,255,255,0.1)",
            }}
            type="button"
            onClick={() => setSelectedLoc(location.name)}
          >
            <span className="block text-sm font-semibold text-white">{location.name}</span>
            <span className="mt-0.5 block text-xs text-white/40">{location.description}</span>
          </button>
        ))}
      </div>

      {!alreadySubscribed && phoneNumber ? (
        <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
          <div className="flex items-start gap-3">
            <button
              aria-label="Toggle SMS notifications"
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded transition-all"
              style={{
                background: wantsSMS ? "#e84b1a" : "rgba(255,255,255,0.08)",
                border: wantsSMS ? "1px solid #e84b1a" : "0.5px solid rgba(255,255,255,0.2)",
                minHeight: "unset",
              }}
              type="button"
              onClick={() => setWantsSMS((current) => !current)}
            >
              {wantsSMS ? <span className="text-sm leading-none text-white">✓</span> : null}
            </button>
            <div>
              <p className="text-sm font-semibold leading-tight text-white">
                Text me when Ben is spotted
              </p>
              <p className="mt-0.5 text-xs text-white/40">
                You&apos;ll get texts for sightings and finish line alerts.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <button
        className="btn-primary w-full rounded-xl px-4 py-4 text-base font-bold text-white transition-opacity active:scale-95"
        disabled={!canSubmit}
        style={{
          background: "#1a6e3c",
          opacity: canSubmit ? 1 : 0.4,
        }}
        type="button"
        onClick={submit}
      >
        {isSubmitting ? "Checking in..." : "Check in here"}
      </button>

      {status ? <p className="mt-3 text-sm font-bold text-white/70">{status}</p> : null}
    </BottomSheet>
  );
}
