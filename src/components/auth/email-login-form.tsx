"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthDivider } from "@/components/auth/auth-divider";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { loginWithEmail } from "@/lib/auth/actions";

interface EmailLoginFormProps {
  next?: string;
  initialError?: string;
}

export function EmailLoginForm({ next, initialError }: EmailLoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginWithEmail, null);
  const errorMessage = state?.error ?? initialError;

  return (
    <div className="space-y-6">
      <OAuthButtons />
      <AuthDivider />

      <form action={formAction} className="space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}

        {errorMessage ? <AuthAlert message={errorMessage} /> : null}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-muted">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email webauthn"
            inputMode="email"
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm text-muted">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        アカウントをお持ちでない方は{" "}
        <Link href="/signup" className="text-accent hover:underline">
          会員登録
        </Link>
      </p>
    </div>
  );
}
