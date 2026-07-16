import { createClient } from "@/lib/supabase/server";
import { HOME_FEED_LIMIT } from "@/lib/reviews/constants";
import type { FeedReviewListItem } from "@/lib/reviews/types";

type ReviewRow = {
  id: string;
  title: string | null;
  body: string;
  rating: number;
  created_at: string;
  gears: { id: string; name: string; brand: string | null } | null;
  users: { display_name: string } | null;
};

export async function listLatestReviews(
  limit = HOME_FEED_LIMIT,
): Promise<FeedReviewListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, title, body, rating, created_at, gears(id, name, brand), users(display_name)",
    )
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("listLatestReviews:", error.message);
    return [];
  }

  return ((data ?? []) as ReviewRow[])
    .filter((review) => review.gears !== null)
    .map((review) => ({
      id: review.id,
      title: review.title,
      body: review.body,
      rating: review.rating,
      created_at: review.created_at,
      author: {
        display_name: review.users?.display_name ?? "ユーザー",
      },
      gear: {
        id: review.gears!.id,
        name: review.gears!.name,
        brand: review.gears!.brand,
      },
    }));
}
