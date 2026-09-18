import { createClient } from "@/lib/supabase/server";
import {
  FEED_REVIEW_SELECT,
  mapFeedReviewRows,
  type FeedReviewRow,
} from "@/lib/reviews/map-feed-review";
import type { FeedReviewListItem } from "@/lib/reviews/types";

export async function listReviewsByUserId(
  userId: string,
  limit?: number,
  offset = 0,
): Promise<FeedReviewListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select(FEED_REVIEW_SELECT)
    .eq("user_id", userId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (limit !== undefined) {
    query = query.range(offset, offset + limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("listReviewsByUserId:", error.message);
    return [];
  }

  return mapFeedReviewRows((data ?? []) as FeedReviewRow[]);
}
