import type { GearStatus } from "@/lib/gears/constants";
import type { Gear, GearCategory } from "@/types/database";

import type { ReviewListImage } from "@/lib/reviews/map-review-images";

export type GearCategoryItem = Pick<GearCategory, "id" | "name">;

export type GearListItem = Pick<
  Gear,
  "id" | "name" | "brand" | "image_url" | "category_id" | "status"
> & {
  category_name: string | null;
};

export type GearDetail = Pick<
  Gear,
  "id" | "name" | "brand" | "description" | "image_url" | "status"
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
    id: string;
    display_name: string;
  };
  images: ReviewListImage[];
};

export type GearReviewStats = {
  count: number;
  averageRating: number | null;
};

export type PendingGearListItem = {
  id: string;
  name: string;
  brand: string | null;
  submitted_name: string;
  status: GearStatus;
  created_at: string;
  category: GearCategoryItem | null;
  submitted_by: {
    id: string;
    display_name: string;
  } | null;
  review_count: number;
};

export type GearActionResult = {
  success: boolean;
  error?: string;
  gearId?: string;
};
