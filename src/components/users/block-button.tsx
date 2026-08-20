"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { blockUser, unblockUser } from "@/lib/blocks/actions";

interface BlockButtonProps {
  targetUserId: string;
  initialIsBlocked?: boolean;
  redirectOnBlock?: string;
}

export function BlockButton({
  targetUserId,
  initialIsBlocked = false,
  redirectOnBlock,
}: BlockButtonProps) {
  const router = useRouter();
  const [isBlocked, setIsBlocked] = useState(initialIsBlocked);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleBlock() {
    setError(null);
    setIsPending(true);

    try {
      const result = await blockUser(targetUserId);

      if (!result.success) {
        setError(result.error ?? "ブロックに失敗しました。");
        return;
      }

      setIsBlocked(true);
      setShowConfirm(false);

      if (redirectOnBlock) {
        router.push(redirectOnBlock);
        router.refresh();
        return;
      }

      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  async function handleUnblock() {
    setError(null);
    setIsPending(true);

    try {
      const result = await unblockUser(targetUserId);

      if (!result.success) {
        setError(result.error ?? "ブロック解除に失敗しました。");
        return;
      }

      setIsBlocked(false);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  if (isBlocked) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleUnblock}
          disabled={isPending}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "処理中..." : "ブロック解除"}
        </button>
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showConfirm ? (
        <div className="w-56 space-y-3 rounded-lg border border-border bg-surface p-3 text-sm">
          <p className="text-muted">
            このユーザーをブロックすると、お互いの投稿やプロフィールが表示されなくなり、フォローも解除されます。
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleBlock}
              disabled={isPending}
              className="flex-1 rounded-lg bg-red-500/90 px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "処理中..." : "ブロックする"}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={isPending}
              className="rounded-lg border border-border px-3 py-2 text-xs text-muted transition-colors hover:border-accent/50"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={isPending}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-red-500/50 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          ブロック
        </button>
      )}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
