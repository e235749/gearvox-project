import { getSupabaseUrl } from "@/lib/env";

const REVIEW_IMAGES_BUCKET = "review-images";

export function getReviewImagePublicUrl(storagePath: string): string {
  const baseUrl = getSupabaseUrl().replace(/\/$/, "");
  return `${baseUrl}/storage/v1/object/public/${REVIEW_IMAGES_BUCKET}/${storagePath}`;
}
