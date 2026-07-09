"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { AuthDivider } from "@/components/auth/auth-divider";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { signupWithEmail } from "@/lib/auth/actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";

export function EmailSignupForm() {
  const [state, formAction, isPending] = useActionState(signupWithEmail, null);

  return (
    <div className="space-y-6">
      <OAuthButtons />
      <AuthDivider />

      <form action={formAction} className="space-y-4">
        {state?.error ? <AuthAlert message={state.error} /> : null}
        {state?.success && state.message ? (
          <AuthAlert message={state.message} variant="success" />
        ) : null}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-muted">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
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
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
          />
          <p className="text-xs text-muted">
            {MIN_PASSWORD_LENGTH}文字以上で入力してください
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm text-muted">
            パスワード（確認）
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "登録中..." : "会員登録"}
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        既にアカウントをお持ちの方は{" "}
        <Link href="/login" className="text-accent hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  );
}
