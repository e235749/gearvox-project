"use client";

import { useState, useTransition } from "react";

import { ReviewListCard } from "@/components/reviews/review-list-card";
import { loadMoreGearReviews } from "@/lib/reviews/load-more-actions";
import type { ReviewEngagementSummary } from "@/lib/reviews/engagement-types";
import type { GearReviewListItem } from "@/lib/gears/types";
import type { SimilarityDisplay } from "@/lib/similarity/types";
import {
  HOME_FEED_LIMIT,
  REVIEW_FEED_LOAD_MORE,
} from "@/lib/reviews/constants";

interface GearReviewFeedListProps {
  gearId: string;
  initialReviews: GearReviewListItem[];
  initialEngagements: Record<string, ReviewEngagementSummary>;
  initialAuthorSimilarities: Record<string, SimilarityDisplay>;
  currentUserId: string | null;
}

export function GearReviewFeedList({
  gearId,
  initialReviews,
  initialEngagements,
  initialAuthorSimilarities,
  currentUserId,
}: GearReviewFeedListProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [engagements, setEngagements] = useState(initialEngagements);
  const [authorSimilarities, setAuthorSimilarities] = useState(
    initialAuthorSimilarities,
  );
  const [hasMore, setHasMore] = useState(
    initialReviews.length >= HOME_FEED_LIMIT,
  );
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    startTransition(async () => {
      const result = await loadMoreGearReviews(
        gearId,
        reviews.length,
        REVIEW_FEED_LOAD_MORE,
      );
      setReviews((prev) => [...prev, ...result.reviews]);
      setEngagements((prev) => ({ ...prev, ...result.engagements }));
      setAuthorSimilarities((prev) => ({
        ...prev,
        ...result.authorSimilarities,
      }));
      setHasMore(result.hasMore);
    });
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
        まだレビューがありません。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {reviews.map((review) => (
          <ReviewListCard
            key={review.id}
            review={review}
            engagement={engagements[review.id]}
            authorSimilarity={authorSimilarities[review.author.id]}
            currentUserId={currentUserId}
          />
        ))}
      </ul>
      {hasMore ? (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isPending}
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-accent transition-colors hover:border-accent/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "読み込み中..." : "もっと見る"}
        </button>
      ) : null}
    </div>
  );
}
