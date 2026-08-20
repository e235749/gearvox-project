import type { ReviewListImage } from "@/lib/reviews/map-review-images";

export type ReviewActionResult = {
  success: boolean;
  error?: string;
  reviewId?: string;
};

export type ReviewDetail = {
  id: string;
  user_id: string;
  gear_id: string;
  title: string | null;
  body: string;
  rating: number;
  created_at: string;
  gear: {
    id: string;
    name: string;
    brand: string | null;
  };
  author: {
    id: string;
    display_name: string;
  };
  images: Array<{
    id: string;
    storage_path: string;
    display_order: number;
  }>;
};

export type FeedReviewListItem = {
  id: string;
  title: string | null;
  body: string;
  rating: number;
  created_at: string;
  author: {
    id: string;
    display_name: string;
  };
  gear: {
    id: string;
    name: string;
    brand: string | null;
  };
  images: ReviewListImage[];
};
