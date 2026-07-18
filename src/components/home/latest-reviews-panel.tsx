import Link from "next/link";

import { ReviewListCard } from "@/components/reviews/review-list-card";
import type { FeedReviewListItem } from "@/lib/reviews/types";

interface LatestReviewsPanelProps {
  reviews: FeedReviewListItem[];
}

export function LatestReviewsPanel({ reviews }: LatestReviewsPanelProps) {
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
        <ReviewListCard key={review.id} review={review} gear={review.gear} />
      ))}
    </ul>
  );
}
