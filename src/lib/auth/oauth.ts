"use client";

import { AUTH_ROUTES } from "@/lib/auth/constants";
import { getSiteUrl } from "@/lib/auth/get-site-url";
import type { OAuthProvider } from "@/lib/auth/types";
import { createClient } from "@/lib/supabase/client";

export async function signInWithOAuth(
  provider: OAuthProvider,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const redirectTo = `${getSiteUrl()}${AUTH_ROUTES.callback}`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  return { error: error?.message ?? null };
}
