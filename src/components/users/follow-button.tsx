"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { followUser, unfollowUser } from "@/lib/follows/actions";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
}: FollowButtonProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setIsPending(true);

    try {
      const result = isFollowing
        ? await unfollowUser(targetUserId)
        : await followUser(targetUserId);

      if (!result.success) {
        setError(result.error ?? "操作に失敗しました。");
        return;
      }

      setIsFollowing(result.isFollowing ?? !isFollowing);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          isFollowing
            ? "border border-border text-muted hover:border-red-500/50 hover:text-red-400"
            : "bg-accent text-background hover:opacity-90"
        }`}
      >
        {isPending
          ? "処理中..."
          : isFollowing
            ? "フォロー中"
            : "フォローする"}
      </button>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
