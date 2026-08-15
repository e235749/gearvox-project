"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { unblockUser } from "@/lib/blocks/actions";
import type { BlockedUserItem } from "@/lib/blocks/types";
import { formatReviewDate } from "@/lib/reviews/format-review-label";

interface BlockedUsersListProps {
  blockedUsers: BlockedUserItem[];
}

export function BlockedUsersList({ blockedUsers }: BlockedUsersListProps) {
  const router = useRouter();
  const [items, setItems] = useState(blockedUsers);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUnblock(blockedId: string) {
    setError(null);
    setPendingId(blockedId);

    try {
      const result = await unblockUser(blockedId);

      if (!result.success) {
        setError(result.error ?? "ブロック解除に失敗しました。");
        return;
      }

      setItems((current) =>
        current.filter((item) => item.blockedId !== blockedId),
      );
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
        ブロック中のユーザーはいません。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.blockedId}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              {item.avatarUrl ? (
                <img
                  src={item.avatarUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-xs text-muted">
                  —
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium">{item.displayName}</p>
                <p className="text-xs text-muted">
                  {formatReviewDate(item.blockedAt)} にブロック
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleUnblock(item.blockedId)}
              disabled={pendingId === item.blockedId}
              className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs text-muted transition-colors hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendingId === item.blockedId ? "解除中..." : "解除"}
            </button>
          </li>
        ))}
      </ul>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
