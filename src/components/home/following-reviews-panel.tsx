import Link from "next/link";

import { ReviewListCard } from "@/components/reviews/review-list-card";
import type { ReviewEngagementSummary } from "@/lib/reviews/engagement-types";
import type { FeedReviewListItem } from "@/lib/reviews/types";
import type { SimilarityDisplay } from "@/lib/similarity/types";

interface FollowingReviewsPanelProps {
  reviews: FeedReviewListItem[];
  followingCount: number;
  engagements: Record<string, ReviewEngagementSummary>;
  authorSimilarities: Record<string, SimilarityDisplay>;
  currentUserId: string | null;
}

export function FollowingReviewsPanel({
  reviews,
  followingCount,
  engagements,
  authorSimilarities,
  currentUserId,
}: FollowingReviewsPanelProps) {
  if (followingCount === 0) {
    return (
      <div className="space-y-3 rounded-lg border border-border bg-surface p-4 text-sm">
        <p className="text-muted">
          まだフォローしているユーザーがいません。
        </p>
        <p className="text-xs text-muted">
          レビューを読んで気になるキャンパーをフォローしてみましょう。
        </p>
        <Link href="/?tab=latest" className="text-accent hover:underline">
          新着レビューを見る
        </Link>
        <Link href="/search" className="block text-accent hover:underline">
          ギアを検索する
        </Link>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="space-y-3 rounded-lg border border-border bg-surface p-4 text-sm">
        <p className="text-muted">
          フォロー中のユーザーのレビューはまだありません。
        </p>
        <Link href="/?tab=latest" className="text-accent hover:underline">
          新着レビューを見る
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <ReviewListCard
          key={review.id}
          review={review}
          gear={review.gear}
          engagement={engagements[review.id]}
          authorSimilarity={authorSimilarities[review.author.id]}
          currentUserId={currentUserId}
        />
      ))}
    </ul>
  );
}
