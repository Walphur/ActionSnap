"use client";

import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

type Props = {
  next?: string;
  mode?: "login" | "register";
  intent?: "racer";
};

export function SocialAuthButtons({
  next = "/fotografos",
  mode = "login",
  intent,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signInWith(provider: "google") {
    setLoading(provider);
    setError(null);

    const origin = window.location.origin;
    const callbackParams = new URLSearchParams({ next });
    if (intent === "racer") callbackParams.set("intent", "racer");
    const redirectTo = `${origin}/auth/callback?${callbackParams.toString()}`;

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
          <div className="w-full border-t border-[var(--color-border)]" />
        </div>
        <p className="relative mx-auto w-fit bg-[var(--color-card)] px-3 text-xs text-[var(--color-text-secondary)]">
          o continuá con
        </p>
      </div>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        disabled={Boolean(loading)}
        loading={loading === "google"}
        onClick={() => signInWith("google")}
      >
        <GoogleIcon />
        Google
      </Button>

      {error && <Alert tone="danger">{error}</Alert>}
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
