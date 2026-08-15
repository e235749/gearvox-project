import Link from "next/link";

import { ReviewListCard } from "@/components/reviews/review-list-card";
import type { ReviewEngagementSummary } from "@/lib/reviews/engagement-types";
import type { FeedReviewListItem } from "@/lib/reviews/types";
import type { SimilarityDisplay } from "@/lib/similarity/types";

interface LatestReviewsPanelProps {
  reviews: FeedReviewListItem[];
  engagements: Record<string, ReviewEngagementSummary>;
  authorSimilarities: Record<string, SimilarityDisplay>;
  currentUserId: string | null;
}

export function LatestReviewsPanel({
  reviews,
  engagements,
  authorSimilarities,
  currentUserId,
}: LatestReviewsPanelProps) {
  if (reviews.length === 0) {
    return (
      <div className="space-y-3 rounded-lg border border-border bg-surface p-4 text-sm">
        <p className="text-muted">まだレビューがありません。</p>
        <Link href="/reviews/new" className="text-accent hover:underline">
          最初のレビューを投稿する
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
