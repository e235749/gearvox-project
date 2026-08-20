import { createClient } from "@/lib/supabase/server";

import type { ReviewEngagementSummary } from "@/lib/reviews/engagement-types";

function createEmptySummary(reviewId: string): ReviewEngagementSummary {
  return {
    reviewId,
    likeCount: 0,
    commentCount: 0,
    isLikedByUser: false,
  };
}

export async function getReviewEngagementSummaries(
  reviewIds: string[],
  userId?: string | null,
): Promise<Record<string, ReviewEngagementSummary>> {
  const uniqueReviewIds = [...new Set(reviewIds)];

  if (uniqueReviewIds.length === 0) {
    return {};
  }

  const supabase = await createClient();

  const [{ data: likesData, error: likesError }, { data: commentsData, error: commentsError }] =
    await Promise.all([
      supabase.from("likes").select("review_id, user_id").in("review_id", uniqueReviewIds),
      supabase
        .from("comments")
        .select("review_id")
        .in("review_id", uniqueReviewIds)
        .eq("is_deleted", false),
    ]);

  type LikeRow = { review_id: string; user_id: string };
  type CommentRow = { review_id: string };

  const likes = (likesData ?? []) as LikeRow[];
  const comments = (commentsData ?? []) as CommentRow[];

  if (likesError) {
    console.error("getReviewEngagementSummaries likes:", likesError.message);
  }

  if (commentsError) {
    console.error("getReviewEngagementSummaries comments:", commentsError.message);
  }

  const summaries = Object.fromEntries(
    uniqueReviewIds.map((reviewId) => [reviewId, createEmptySummary(reviewId)]),
  ) as Record<string, ReviewEngagementSummary>;

  for (const like of likes) {
    const reviewId = like.review_id;
    const summary = summaries[reviewId];

    if (!summary) {
      continue;
    }

    summary.likeCount += 1;

    if (userId && like.user_id === userId) {
      summary.isLikedByUser = true;
    }
  }

  for (const comment of comments) {
    const reviewId = comment.review_id;
    const summary = summaries[reviewId];

    if (summary) {
      summary.commentCount += 1;
    }
  }

  return summaries;
}

export async function loadEngagementsForReviews(
  reviews: Array<{ id: string }>,
  userId?: string | null,
): Promise<Record<string, ReviewEngagementSummary>> {
  return getReviewEngagementSummaries(
    reviews.map((review) => review.id),
    userId,
  );
}
