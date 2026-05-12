"use client";

import { useEffect, useState } from "react";
import type { RaceUpdateInput, RaceUpdateType } from "@/types/raceUpdate";

type PostUpdateModalProps = {
  isConfigured: boolean;
  isOpen: boolean;
  onClose: () => void;
  onPost: (input: RaceUpdateInput) => Promise<void>;
};

const savedNameKey = "ironmanben-family-name";
const updateTypes: Array<{ value: RaceUpdateType; label: string }> = [
  { value: "ben", label: "Saw Ben" },
  { value: "parking", label: "Parking" },
  { value: "food", label: "Food" },
  { value: "meetup", label: "Meetup" },
  { value: "help", label: "Need Help" },
  { value: "general", label: "General" },
];

export function PostUpdateModal({ isConfigured, isOpen, onClose, onPost }: PostUpdateModalProps) {
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<RaceUpdateType>("general");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setAuthor(window.localStorage.getItem(savedNameKey) ?? "");
    setMessage("");
    setLocation("");
    setType("ben");
    setStatus(null);
    setIsSubmitting(false);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const canSubmit =
    isConfigured && author.trim().length > 0 && message.trim().length > 0 && !isSubmitting;

  async function submit() {
    if (!canSubmit) {
      return;
    }

    window.localStorage.setItem(savedNameKey, author.trim());
    setIsSubmitting(true);
    setStatus("Posting...");

    try {
      await onPost({
        author: author.trim(),
        message: message.trim(),
        location: location.trim(),
        type,
      });
      setStatus("Posted.");
      window.setTimeout(onClose, 500);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end bg-black/55 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <section className="w-full rounded-lg border border-white/10 bg-ink/[0.88] p-4 text-white shadow-2xl backdrop-blur-lg sm:max-w-md sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-surge">Live update</p>
            <h2 className="mt-1 text-3xl font-black">Post Update</h2>
          </div>
          <button
            className="focus-ring rounded-md border border-white/20 px-3 py-2 text-sm font-black text-white"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>

        {!isConfigured ? (
          <p className="mt-3 rounded-md bg-surge/20 p-3 text-sm font-bold text-white">
            Supabase is not configured yet. Add the environment variables before race day.
          </p>
        ) : null}

        <label className="mt-4 block text-sm font-black text-white" htmlFor="update-author">
          Name
        </label>
        <input
          id="update-author"
          className="mt-2 w-full rounded-md border border-white/15 bg-white px-3 py-3 text-base font-bold text-ink outline-none focus:border-river"
          autoComplete="name"
          maxLength={48}
          placeholder="Dad"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
        />

        <label className="mt-4 block text-sm font-black text-white" htmlFor="update-message">
          Message
        </label>
        <textarea
          id="update-message"
          className="mt-2 min-h-24 w-full rounded-md border border-white/15 bg-white px-3 py-3 text-base text-ink outline-none focus:border-river"
          maxLength={180}
          placeholder="Ben just passed Five Points."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />

        <label className="mt-4 block text-sm font-black text-white" htmlFor="update-location">
          Location <span className="font-semibold text-white/55">optional</span>
        </label>
        <input
          id="update-location"
          className="mt-2 w-full rounded-md border border-white/15 bg-white px-3 py-3 text-base text-ink outline-none focus:border-river"
          maxLength={80}
          placeholder="Five Points"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {updateTypes.map((item) => (
            <button
              key={item.value}
              className={`focus-ring min-h-12 rounded-md border px-3 py-3 text-sm font-black ${
                type === item.value
                  ? "border-surge bg-surge text-white"
                  : "border-white/15 bg-white/10 text-white"
              }`}
              type="button"
              onClick={() => setType(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          className="focus-ring mt-5 min-h-14 w-full rounded-md bg-river px-4 py-3 text-base font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canSubmit}
          type="button"
          onClick={submit}
        >
          Post update
        </button>

        {status ? <p className="mt-3 text-sm font-bold text-white/80">{status}</p> : null}
      </section>
    </div>
  );
}
