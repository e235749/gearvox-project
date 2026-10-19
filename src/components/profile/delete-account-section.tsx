"use client";

import { useActionState, useState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { deleteAccount } from "@/lib/auth/delete-account";

export function DeleteAccountSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(deleteAccount, null);

  return (
    <section className="space-y-3 rounded-lg border border-red-500/30 p-4">
      <div className="space-y-1">
        <h2 className="text-sm font-medium">アカウントを削除</h2>
        <p className="text-xs leading-5 text-muted">
          プロフィール、レビュー、コメント、画像、キャンプスタイル、フォローは削除されます。申請したギアの名前は、他の人の参照用に残ることがあります。
        </p>
      </div>

      {isOpen ? (
        <form action={formAction} className="space-y-3">
          {state?.error ? <AuthAlert message={state.error} /> : null}
          <label htmlFor="confirmation" className="text-xs text-muted">
            確認のため「削除」と入力してください
          </label>
          <input
            id="confirmation"
            name="confirmation"
            type="text"
            autoComplete="off"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-red-400"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg border border-red-500/50 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "削除中..." : "アカウントを完全に削除"}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted"
            >
              キャンセル
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-lg border border-red-500/50 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
        >
          アカウントを削除
        </button>
      )}
    </section>
  );
}
