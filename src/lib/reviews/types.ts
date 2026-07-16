export type ReviewActionResult = {
  success: boolean;
  error?: string;
  reviewId?: string;
};

export type ReviewDetail = {
  id: string;
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
    display_name: string;
  };
  gear: {
    id: string;
    name: string;
    brand: string | null;
  };
};
