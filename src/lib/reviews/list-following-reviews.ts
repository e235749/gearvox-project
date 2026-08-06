import { createClient } from "@/lib/supabase/server";
import { HOME_FEED_LIMIT } from "@/lib/reviews/constants";
import { mapReviewImages } from "@/lib/reviews/map-review-images";
import type { FeedReviewListItem } from "@/lib/reviews/types";

import { listFollowingIds } from "@/lib/follows/is-following";

type ReviewRow = {
  id: string;
  title: string | null;
  body: string;
  rating: number;
  created_at: string;
  gears: { id: string; name: string; brand: string | null } | null;
  users: { id: string; display_name: string } | null;
  review_images: Array<{
    id: string;
    storage_path: string;
    display_order: number;
  }> | null;
};

export async function listFollowingReviews(
  userId: string,
  limit = HOME_FEED_LIMIT,
): Promise<FeedReviewListItem[]> {
  const followingIds = await listFollowingIds(userId);

  if (followingIds.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, title, body, rating, created_at, gears(id, name, brand), users(id, display_name), review_images(id, storage_path, display_order)",
    )
    .eq("is_deleted", false)
    .in("user_id", followingIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("listFollowingReviews:", error.message);
    return [];
  }

  return ((data ?? []) as ReviewRow[])
    .filter((review) => review.gears !== null && review.users !== null)
    .map((review) => ({
      id: review.id,
      title: review.title,
      body: review.body,
      rating: review.rating,
      created_at: review.created_at,
      author: {
        id: review.users!.id,
        display_name: review.users!.display_name,
      },
      gear: {
        id: review.gears!.id,
        name: review.gears!.name,
        brand: review.gears!.brand,
      },
      images: mapReviewImages(review.review_images),
    }));
}
