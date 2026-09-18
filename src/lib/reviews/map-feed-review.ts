import { truncateReviewBody } from "@/lib/reviews/constants";
import { mapReviewImages } from "@/lib/reviews/map-review-images";
import type { FeedReviewListItem } from "@/lib/reviews/types";

export type FeedReviewRow = {
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

export const FEED_REVIEW_SELECT =
  "id, title, body, rating, created_at, gears(id, name, brand), users(id, display_name), review_images(id, storage_path, display_order)";

export function mapFeedReviewRow(review: FeedReviewRow): FeedReviewListItem | null {
  if (!review.gears || !review.users) {
    return null;
  }

  return {
    id: review.id,
    title: review.title,
    bodyPreview: truncateReviewBody(review.body),
    rating: review.rating,
    created_at: review.created_at,
    author: {
      id: review.users.id,
      display_name: review.users.display_name,
    },
    gear: {
      id: review.gears.id,
      name: review.gears.name,
      brand: review.gears.brand,
    },
    images: mapReviewImages(review.review_images),
  };
}

export function mapFeedReviewRows(rows: FeedReviewRow[]): FeedReviewListItem[] {
  return rows
    .map(mapFeedReviewRow)
    .filter((review): review is FeedReviewListItem => review !== null);
}
