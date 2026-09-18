"use server";

import { REVIEW_FEED_LOAD_MORE } from "@/lib/reviews/constants";
import { loadEngagementsForReviews } from "@/lib/reviews/get-review-engagements";
import { listFollowingReviews } from "@/lib/reviews/list-following-reviews";
import { listLatestReviews } from "@/lib/reviews/list-latest-reviews";
import { listReviewsByUserId } from "@/lib/reviews/list-user-reviews";
import type { ReviewEngagementSummary } from "@/lib/reviews/engagement-types";
import type { FeedReviewListItem } from "@/lib/reviews/types";
import { listReviewsByGearId } from "@/lib/gears/list-gear-reviews";
import type { GearReviewListItem } from "@/lib/gears/types";
import { loadSimilarityDisplaysForReviewAuthors } from "@/lib/similarity/load-review-author-similarities";
import type { SimilarityDisplay } from "@/lib/similarity/types";
import { createClient } from "@/lib/supabase/server";
import { listFilteredFeedReviews } from "@/lib/reviews/list-filtered-feed-reviews";

export type LoadMoreFeedResult = {
  reviews: FeedReviewListItem[];
  engagements: Record<string, ReviewEngagementSummary>;
  authorSimilarities: Record<string, SimilarityDisplay>;
  hasMore: boolean;
};

async function attachFeedMeta(
  reviews: FeedReviewListItem[],
  requestedLimit: number,
): Promise<LoadMoreFeedResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [engagements, authorSimilarities] = await Promise.all([
    loadEngagementsForReviews(reviews, user?.id),
    loadSimilarityDisplaysForReviewAuthors(
      user?.id,
      reviews.map((review) => review.author.id),
    ),
  ]);

  return {
    reviews,
    engagements,
    authorSimilarities,
    hasMore: reviews.length >= requestedLimit,
  };
}

export async function loadMoreLatestReviews(
  offset: number,
  limit = REVIEW_FEED_LOAD_MORE,
): Promise<LoadMoreFeedResult> {
  const reviews = await listLatestReviews(limit, offset);
  return attachFeedMeta(reviews, limit);
}

export async function loadMoreFollowingReviews(
  offset: number,
  limit = REVIEW_FEED_LOAD_MORE,
): Promise<LoadMoreFeedResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      reviews: [],
      engagements: {},
      authorSimilarities: {},
      hasMore: false,
    };
  }

  const reviews = await listFollowingReviews(user.id, limit, offset);
  return attachFeedMeta(reviews, limit);
}

export async function loadMoreUserReviews(
  userId: string,
  offset: number,
  limit = REVIEW_FEED_LOAD_MORE,
): Promise<LoadMoreFeedResult> {
  const reviews = await listReviewsByUserId(userId, limit, offset);
  return attachFeedMeta(reviews, limit);
}

export async function loadMoreFilteredFeedReviews(input: {
  offset: number;
  limit?: number;
  categoryId?: string | null;
  brand?: string | null;
}): Promise<LoadMoreFeedResult> {
  const limit = input.limit ?? REVIEW_FEED_LOAD_MORE;
  const reviews = await listFilteredFeedReviews({
    categoryId: input.categoryId,
    brand: input.brand,
    limit,
    offset: input.offset,
  });
  return attachFeedMeta(reviews, limit);
}

export type LoadMoreGearReviewsResult = {
  reviews: GearReviewListItem[];
  engagements: Record<string, ReviewEngagementSummary>;
  authorSimilarities: Record<string, SimilarityDisplay>;
  hasMore: boolean;
};

export async function loadMoreGearReviews(
  gearId: string,
  offset: number,
  limit = REVIEW_FEED_LOAD_MORE,
): Promise<LoadMoreGearReviewsResult> {
  const reviews = await listReviewsByGearId(gearId, limit, offset);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [engagements, authorSimilarities] = await Promise.all([
    loadEngagementsForReviews(reviews, user?.id),
    loadSimilarityDisplaysForReviewAuthors(
      user?.id,
      reviews.map((review) => review.author.id),
    ),
  ]);

  return {
    reviews,
    engagements,
    authorSimilarities,
    hasMore: reviews.length >= limit,
  };
}
