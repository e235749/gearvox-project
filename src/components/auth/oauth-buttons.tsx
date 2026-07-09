"use client";

import { IconBrandApple, IconBrandGoogle } from "@tabler/icons-react";
import { useState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { signInWithOAuth } from "@/lib/auth/oauth";
import type { OAuthProvider } from "@/lib/auth/types";

const providers: Array<{
  id: OAuthProvider;
  label: string;
  icon: typeof IconBrandGoogle;
}> = [
  { id: "google", label: "Googleで続ける", icon: IconBrandGoogle },
  { id: "apple", label: "Appleで続ける", icon: IconBrandApple },
];

export function OAuthButtons() {
  const [error, setError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(
    null,
  );

  async function handleOAuth(provider: OAuthProvider) {
    setError(null);
    setLoadingProvider(provider);

    const { error: oauthError } = await signInWithOAuth(provider);
    if (oauthError) {
      setError(oauthError);
      setLoadingProvider(null);
    }
  }

  return (
    <div className="space-y-3">
      {error ? <AuthAlert message={error} /> : null}
      {providers.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          disabled={loadingProvider !== null}
          onClick={() => handleOAuth(id)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium transition-colors hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon size={20} stroke={1.5} />
          {loadingProvider === id ? "リダイレクト中..." : label}
        </button>
      ))}
    </div>
  );
}
