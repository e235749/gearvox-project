import { createClient } from "@/lib/supabase/server";
import { HOME_FEED_LIMIT } from "@/lib/reviews/constants";
import {
  FEED_REVIEW_SELECT,
  mapFeedReviewRows,
  type FeedReviewRow,
} from "@/lib/reviews/map-feed-review";
import type { FeedReviewListItem } from "@/lib/reviews/types";

export type FeedReviewFilter = {
  categoryId?: string | null;
  brand?: string | null;
  limit?: number;
  offset?: number;
};

export async function listFilteredFeedReviews(
  filter: FeedReviewFilter = {},
): Promise<FeedReviewListItem[]> {
  const limit = filter.limit ?? HOME_FEED_LIMIT;
  const offset = filter.offset ?? 0;
  const categoryId = filter.categoryId?.trim() || null;
  const brand = filter.brand?.trim() || null;

  const supabase = await createClient();

  if (!categoryId && !brand) {
    const { data, error } = await supabase
      .from("reviews")
      .select(FEED_REVIEW_SELECT)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("listFilteredFeedReviews:", error.message);
      return [];
    }

    return mapFeedReviewRows((data ?? []) as FeedReviewRow[]);
  }

  let gearQuery = supabase.from("gears").select("id");

  if (categoryId) {
    gearQuery = gearQuery.eq("category_id", categoryId);
  }

  if (brand) {
    gearQuery = gearQuery.eq("brand", brand);
  }

  const { data: gearsData, error: gearsError } = await gearQuery;

  if (gearsError) {
    console.error("listFilteredFeedReviews gears:", gearsError.message);
    return [];
  }

  const gearIds = ((gearsData ?? []) as Array<{ id: string }>).map(
    (gear) => gear.id,
  );

  if (gearIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("reviews")
    .select(FEED_REVIEW_SELECT)
    .eq("is_deleted", false)
    .in("gear_id", gearIds)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("listFilteredFeedReviews:", error.message);
    return [];
  }

  return mapFeedReviewRows((data ?? []) as FeedReviewRow[]);
}

export async function listDistinctGearBrands(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gears")
    .select("brand")
    .not("brand", "is", null)
    .order("brand", { ascending: true });

  if (error) {
    console.error("listDistinctGearBrands:", error.message);
    return [];
  }

  const brands = new Set<string>();
  for (const row of (data ?? []) as Array<{ brand: string | null }>) {
    const value = row.brand?.trim();
    if (value) {
      brands.add(value);
    }
  }

  return [...brands];
}
