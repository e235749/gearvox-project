"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { deleteReview } from "@/lib/reviews/actions";

interface ReviewOwnerActionsProps {
  reviewId: string;
}

export function ReviewOwnerActions({ reviewId }: ReviewOwnerActionsProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);

    try {
      const result = await deleteReview(reviewId);

      if (result.success) {
        router.push("/profile");
        router.refresh();
        return;
      }

      setError(result.error ?? "削除に失敗しました。");
      setIsConfirming(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-3 border-t border-border pt-4">
      {error ? <AuthAlert message={error} /> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/reviews/${reviewId}/edit`}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          編集
        </Link>

        {isConfirming ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted">本当に削除しますか？</p>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-lg border border-red-500/50 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "削除中..." : "削除する"}
            </button>
            <button
              type="button"
              onClick={() => setIsConfirming(false)}
              disabled={isDeleting}
              className="rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              キャンセル
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsConfirming(true)}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-red-500/50 hover:text-red-400"
          >
            削除
          </button>
        )}
      </div>
    </div>
  );
}
