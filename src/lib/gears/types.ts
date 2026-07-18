import type { Gear, GearCategory } from "@/types/database";

import type { ReviewListImage } from "@/lib/reviews/map-review-images";

export type GearCategoryItem = Pick<GearCategory, "id" | "name">;

export type GearListItem = Pick<
  Gear,
  "id" | "name" | "brand" | "image_url" | "category_id"
> & {
  category_name: string | null;
};

export type GearDetail = Pick<
  Gear,
  "id" | "name" | "brand" | "description" | "image_url"
> & {
  category: GearCategoryItem | null;
};

export type GearReviewListItem = {
  id: string;
  title: string | null;
  body: string;
  rating: number;
  created_at: string;
  author: {
    display_name: string;
  };
  images: ReviewListImage[];
};

export type GearReviewStats = {
  count: number;
  averageRating: number | null;
};
