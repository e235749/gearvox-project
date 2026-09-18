import Link from "next/link";

import { ReviewFeedList } from "@/components/reviews/review-feed-list";
import type { ReviewEngagementSummary } from "@/lib/reviews/engagement-types";
import type { FeedReviewListItem } from "@/lib/reviews/types";
import type { SimilarityDisplay } from "@/lib/similarity/types";
import { HOME_FEED_LIMIT } from "@/lib/reviews/constants";

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
        <p className="text-muted">まだ誰もフォローしていません。</p>
        <Link href="/search" className="text-accent hover:underline">
          ギアからキャンパーを探す
        </Link>
      </div>
    );
  }

  return (
    <ReviewFeedList
      initialReviews={reviews}
      initialEngagements={engagements}
      initialAuthorSimilarities={authorSimilarities}
      currentUserId={currentUserId}
      source={{ type: "following" }}
      initialLimit={HOME_FEED_LIMIT}
      emptyMessage={
        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
          フォロー中のユーザーのレビューはまだありません。
        </div>
      }
    />
  );
}
