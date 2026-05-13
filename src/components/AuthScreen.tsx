"use client";

import { useEffect, useRef, useState } from "react";

type AuthScreenProps = {
  isConfigured: boolean;
  isLoading: boolean;
  onSendOtp: (phone: string) => Promise<void>;
  onVerifyOtp: (phone: string, token: string) => Promise<void>;
};

export function AuthScreen({ isConfigured, isLoading, onSendOtp, onVerifyOtp }: AuthScreenProps) {
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [hasSentCode, setHasSentCode] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tokenRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hasSentCode) {
      tokenRef.current?.focus();
    }
  }, [hasSentCode]);

  async function sendCode() {
    if (!isConfigured || phone.trim().length < 8 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setStatus("Sending code...");

    try {
      await onSendOtp(phone);
      setHasSentCode(true);
      setStatus("Code sent.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not send code.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyCode() {
    if (!isConfigured || token.trim().length !== 6 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setStatus("Checking code...");

    try {
      await onVerifyOtp(phone, token);
      setStatus("Logged in.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not verify code.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSend = isConfigured && phone.trim().length >= 8 && !isSubmitting && !isLoading;
  const canVerify = isConfigured && token.trim().length === 6 && !isSubmitting && !isLoading;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-950 p-3 text-white">
      <section className="w-full max-w-sm rounded-xl border border-white/20 bg-black p-4 shadow-2xl">
        <p className="text-xs font-black uppercase text-lime-300">Ben Race HQ</p>
        <h1 className="mt-1 text-3xl font-black leading-tight">Family Login</h1>
        <p className="mt-3 text-sm font-bold leading-6 text-white/70">
          Enter a phone number to get a one-time code. No password needed.
        </p>

        {!isConfigured ? (
          <p className="mt-4 rounded-xl border border-orange-300/35 bg-orange-500/20 p-3 text-sm font-bold text-white">
            Supabase is not configured yet. Add the environment variables before race day.
          </p>
        ) : null}

        <label className="mt-5 block text-sm font-black text-white" htmlFor="auth-phone">
          Phone number
        </label>
        <input
          id="auth-phone"
          className="mt-2 h-14 w-full rounded-xl border border-white/25 bg-white px-3 font-mono text-lg font-black text-zinc-950 outline-none focus:border-lime-300"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+19045550123"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />

        <button
          className="focus-ring mt-4 w-full bg-lime-300 px-4 py-3 text-base font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canSend}
          type="button"
          onClick={sendCode}
        >
          Send Code
        </button>

        {hasSentCode ? (
          <>
            <label className="mt-5 block text-sm font-black text-white" htmlFor="auth-code">
              6-digit code
            </label>
            <input
              ref={tokenRef}
              id="auth-code"
              className="mt-2 h-14 w-full rounded-xl border border-white/25 bg-white px-3 text-center font-mono text-2xl font-black tracking-[0.18em] text-zinc-950 outline-none focus:border-lime-300"
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={token}
              onChange={(event) => setToken(event.target.value.replace(/\D/g, "").slice(0, 6))}
            />

            <button
              className="focus-ring mt-4 w-full bg-white px-4 py-3 text-base font-black text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canVerify}
              type="button"
              onClick={verifyCode}
            >
              Log In
            </button>
          </>
        ) : null}

        {status ? <p className="mt-4 text-sm font-bold text-white/75">{status}</p> : null}
      </section>
    </main>
  );
}
