import { createClient } from "@/lib/supabase/server";
import { HOME_FEED_LIMIT } from "@/lib/reviews/constants";
import {
  FEED_REVIEW_SELECT,
  mapFeedReviewRows,
  type FeedReviewRow,
} from "@/lib/reviews/map-feed-review";
import type { FeedReviewListItem } from "@/lib/reviews/types";

import { listFollowingIds } from "@/lib/follows/is-following";

export async function listFollowingReviews(
  userId: string,
  limit = HOME_FEED_LIMIT,
  offset = 0,
): Promise<FeedReviewListItem[]> {
  const followingIds = await listFollowingIds(userId);

  if (followingIds.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(FEED_REVIEW_SELECT)
    .eq("is_deleted", false)
    .in("user_id", followingIds)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("listFollowingReviews:", error.message);
    return [];
  }

  return mapFeedReviewRows((data ?? []) as FeedReviewRow[]);
}
