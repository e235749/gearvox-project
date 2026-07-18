import { createClient } from "@/lib/supabase/server";

import type { ReviewDetail } from "@/lib/reviews/types";

type ReviewRow = {
  id: string;
  user_id: string;
  gear_id: string;
  title: string | null;
  body: string;
  rating: number;
  created_at: string;
  gears: { id: string; name: string; brand: string | null } | null;
  users: { display_name: string } | null;
};

type ReviewImageRow = {
  id: string;
  storage_path: string;
  display_order: number;
};

export async function getReviewById(
  reviewId: string,
): Promise<ReviewDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, user_id, gear_id, title, body, rating, created_at, gears(id, name, brand), users(display_name)",
    )
    .eq("id", reviewId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("getReviewById:", error.message);
    }
    return null;
  }

  const review = data as ReviewRow;

  const { data: imagesData, error: imagesError } = await supabase
    .from("review_images")
    .select("id, storage_path, display_order")
    .eq("review_id", reviewId)
    .order("display_order", { ascending: true });

  if (imagesError) {
    console.error("getReviewById images:", imagesError.message);
  }

  const images = (imagesData ?? []) as ReviewImageRow[];
  const gear = review.gears;
  const author = review.users;

  if (!gear) {
    return null;
  }

  return {
    id: review.id,
    user_id: review.user_id,
    gear_id: review.gear_id,
    title: review.title,
    body: review.body,
    rating: review.rating,
    created_at: review.created_at,
    gear: {
      id: gear.id,
      name: gear.name,
      brand: gear.brand,
    },
    author: {
      display_name: author?.display_name ?? "ユーザー",
    },
    images,
  };
}
