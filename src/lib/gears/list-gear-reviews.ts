import { createClient } from "@/lib/supabase/server";
import { mapReviewImages } from "@/lib/reviews/map-review-images";

import type { GearReviewListItem, GearReviewStats } from "@/lib/gears/types";

type ReviewRow = {
  id: string;
  title: string | null;
  body: string;
  rating: number;
  created_at: string;
  users: { id: string; display_name: string } | null;
  review_images: Array<{
    id: string;
    storage_path: string;
    display_order: number;
  }> | null;
};

export async function listReviewsByGearId(
  gearId: string,
): Promise<GearReviewListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, title, body, rating, created_at, users(id, display_name), review_images(id, storage_path, display_order)",
    )
    .eq("gear_id", gearId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listReviewsByGearId:", error.message);
    return [];
  }

  return ((data ?? []) as ReviewRow[])
    .filter((review) => review.users !== null)
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
    images: mapReviewImages(review.review_images),
  }));
}

export async function getGearReviewStats(
  gearId: string,
): Promise<GearReviewStats> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("gear_id", gearId)
    .eq("is_deleted", false);

  if (error) {
    console.error("getGearReviewStats:", error.message);
    return { count: 0, averageRating: null };
  }

  const ratings = ((data ?? []) as Array<{ rating: number }>).map(
    (row) => row.rating,
  );
  if (ratings.length === 0) {
    return { count: 0, averageRating: null };
  }

  const sum = ratings.reduce((total, rating) => total + rating, 0);

  return {
    count: ratings.length,
    averageRating: sum / ratings.length,
  };
}
