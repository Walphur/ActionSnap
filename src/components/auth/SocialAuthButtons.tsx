"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  next?: string;
  mode?: "login" | "register";
};

export function SocialAuthButtons({ next = "/fotografos", mode = "login" }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signInWith(provider: "google") {
    setLoading(provider);
    setError(null);

    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        ...(mode === "register"
          ? {
              scopes: "email profile",
            }
          : {}),
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <p className="relative mx-auto w-fit bg-[var(--surface)] px-3 text-xs text-[var(--muted)]">
          o continuá con
        </p>
      </div>

      <button
        type="button"
        disabled={Boolean(loading)}
        onClick={() => signInWith("google")}
        className="btn-ghost flex w-full items-center justify-center gap-2 !py-3"
      >
        <GoogleIcon />
        {loading === "google" ? "Redirigiendo…" : "Google"}
      </button>

      {error && <p className="text-center text-sm text-red-400">{error}</p>}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5c-.2 1.2-1.6 3.5-5 3.5-3 0-5.5-2.5-5.5-5.5S9 6.3 12 6.3c1.7 0 2.8.7 3.5 1.3l2.4-2.3C16.5 3.8 14.4 3 12 3 7.5 3 3.8 6.7 3.8 11.2S7.5 19.5 12 19.5c6.9 0 8.6-4.8 8.6-7.2 0-.5 0-1-.1-1.3H12z"
      />
    </svg>
  );
}
