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

/**
 * 簡単検索: カテゴリとブランドは AND 条件。
 * - 両方指定 → 両方に一致するギアのレビュー
 * - 片方のみ → その条件だけで絞る（もう一方は「すべて」）
 * - どちらもなし → 全件
 */
export async function listFilteredFeedReviews(
  filter: FeedReviewFilter = {},
): Promise<FeedReviewListItem[]> {
  const limit = filter.limit ?? HOME_FEED_LIMIT;
  const offset = filter.offset ?? 0;
  const categoryId = filter.categoryId?.trim() || null;
  const brand = filter.brand?.trim() || null;

  const supabase = await createClient();

  // フィルタなし
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

  // AND: 指定された条件だけを積み上げる（未指定側は制限しない）
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

  // PostgREST の in() は件数上限があるため、多すぎる場合はチャンクする
  const chunkSize = 100;
  const chunks: string[][] = [];
  for (let i = 0; i < gearIds.length; i += chunkSize) {
    chunks.push(gearIds.slice(i, i + chunkSize));
  }

  const collected: FeedReviewRow[] = [];

  for (const chunk of chunks) {
    const { data, error } = await supabase
      .from("reviews")
      .select(FEED_REVIEW_SELECT)
      .eq("is_deleted", false)
      .in("gear_id", chunk)
      .order("created_at", { ascending: false })
      .range(0, offset + limit - 1);

    if (error) {
      console.error("listFilteredFeedReviews:", error.message);
      return [];
    }

    collected.push(...((data ?? []) as FeedReviewRow[]));
  }

  const sorted = collected.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return mapFeedReviewRows(sorted.slice(offset, offset + limit));
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
