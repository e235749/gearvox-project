"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";

import { ReviewListCard } from "@/components/reviews/review-list-card";
import {
  loadMoreFilteredFeedReviews,
  loadMoreFollowingReviews,
  loadMoreLatestReviews,
  loadMoreUserReviews,
  type LoadMoreFeedResult,
} from "@/lib/reviews/load-more-actions";
import type { ReviewEngagementSummary } from "@/lib/reviews/engagement-types";
import type { FeedReviewListItem } from "@/lib/reviews/types";
import type { SimilarityDisplay } from "@/lib/similarity/types";
import {
  HOME_FEED_LIMIT,
  REVIEW_FEED_LOAD_MORE,
} from "@/lib/reviews/constants";

type FeedSource =
  | { type: "latest" }
  | { type: "following" }
  | { type: "user"; userId: string }
  | {
      type: "filtered";
      categoryId?: string | null;
      brand?: string | null;
    };

interface ReviewFeedListProps {
  initialReviews: FeedReviewListItem[];
  initialEngagements: Record<string, ReviewEngagementSummary>;
  initialAuthorSimilarities: Record<string, SimilarityDisplay>;
  currentUserId: string | null;
  source: FeedSource;
  initialLimit?: number;
  loadMoreLimit?: number;
  showAuthor?: boolean;
  emptyMessage?: ReactNode;
}

export function ReviewFeedList({
  initialReviews,
  initialEngagements,
  initialAuthorSimilarities,
  currentUserId,
  source,
  initialLimit = HOME_FEED_LIMIT,
  loadMoreLimit = REVIEW_FEED_LOAD_MORE,
  showAuthor = true,
  emptyMessage,
}: ReviewFeedListProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [engagements, setEngagements] = useState(initialEngagements);
  const [authorSimilarities, setAuthorSimilarities] = useState(
    initialAuthorSimilarities,
  );
  const [hasMore, setHasMore] = useState(initialReviews.length >= initialLimit);
  const [isPending, startTransition] = useTransition();

  // 簡単検索などで server から新しい一覧が来たら state を同期する
  useEffect(() => {
    setReviews(initialReviews);
    setEngagements(initialEngagements);
    setAuthorSimilarities(initialAuthorSimilarities);
    setHasMore(initialReviews.length >= initialLimit);
  }, [
    initialReviews,
    initialEngagements,
    initialAuthorSimilarities,
    initialLimit,
  ]);

  function handleLoadMore() {
    startTransition(async () => {
      let result: LoadMoreFeedResult;

      if (source.type === "latest") {
        result = await loadMoreLatestReviews(reviews.length, loadMoreLimit);
      } else if (source.type === "following") {
        result = await loadMoreFollowingReviews(reviews.length, loadMoreLimit);
      } else if (source.type === "user") {
        result = await loadMoreUserReviews(
          source.userId,
          reviews.length,
          loadMoreLimit,
        );
      } else {
        result = await loadMoreFilteredFeedReviews({
          offset: reviews.length,
          limit: loadMoreLimit,
          categoryId: source.categoryId,
          brand: source.brand,
        });
      }

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
      emptyMessage ?? (
        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
          レビューがありません。
        </div>
      )
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {reviews.map((review) => (
          <ReviewListCard
            key={review.id}
            review={review}
            gear={review.gear}
            showAuthor={showAuthor}
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
