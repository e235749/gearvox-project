export type ReviewListImage = {
  id: string;
  storage_path: string;
  display_order: number;
};

type ReviewImageRow = {
  id: string;
  storage_path: string;
  display_order: number;
};

export function mapReviewImages(
  images: ReviewImageRow[] | null | undefined,
): ReviewListImage[] {
  return (images ?? [])
    .slice()
    .sort((a, b) => a.display_order - b.display_order);
}
