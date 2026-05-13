"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AuthScreenProps = {
  onAuthenticated: () => void;
  onSkipGuest: () => void;
};

export function AuthScreen({ onAuthenticated, onSkipGuest }: AuthScreenProps) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const passcode = process.env.NEXT_PUBLIC_RACE_PASSCODE ?? "";
  const canSubmit = pin.length >= 4;

  function submit() {
    if (!canSubmit) {
      return;
    }

    if (pin === passcode) {
      window.localStorage.setItem("auth_token", "crew_authenticated");
      window.localStorage.removeItem("guest_name");
      onAuthenticated();
      router.replace("/");
      return;
    }

    setError("Wrong code — ask Ben");
    setPin("");
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-950 p-3 text-white">
      <section className="w-full max-w-sm rounded-xl border border-white/20 bg-black p-4 shadow-2xl">
        <p className="text-xs font-black uppercase text-lime-300">Ben Race HQ</p>
        <h1 className="mt-1 text-3xl font-black leading-tight">Family Login</h1>
        <p className="mt-3 text-sm font-bold leading-6 text-white/70">
          Enter the race-day crew code.
        </p>

        <label className="mt-5 block text-sm font-black text-white" htmlFor="auth-pin">
          Crew PIN
        </label>
        <input
          id="auth-pin"
          autoComplete="one-time-code"
          className="mt-2 h-14 w-full rounded-xl border border-white/25 bg-white px-3 text-center font-mono text-2xl font-black tracking-[0.18em] text-zinc-950 outline-none focus:border-lime-300"
          inputMode="numeric"
          maxLength={6}
          placeholder="••••"
          type="password"
          value={pin}
          onChange={(event) => {
            setError(null);
            setPin(event.target.value.replace(/\D/g, "").slice(0, 6));
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              submit();
            }
          }}
        />

        <button
          className="focus-ring mt-4 w-full bg-lime-300 px-4 py-3 text-base font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canSubmit}
          type="button"
          onClick={submit}
        >
          Enter Race HQ
        </button>

        {error ? (
          <div className="mt-3 rounded-xl border border-[#e84b1a]/30 bg-[#e84b1a]/15 p-3 text-sm font-medium text-[#f07050]">
            {error}
          </div>
        ) : null}

        <button
          className="mt-4 w-full border-0 bg-transparent py-2 text-center text-sm text-white/30"
          style={{ minHeight: "44px" }}
          type="button"
          onClick={() => {
            window.localStorage.setItem("guest_name", "Guest");
            onSkipGuest();
          }}
        >
          Skip login — view as guest
        </button>
      </section>
    </main>
  );
}
