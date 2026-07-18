import { createClient } from "@/lib/supabase/server";

const REVIEW_IMAGES_BUCKET = "review-images";

function buildStoragePath(
  userId: string,
  reviewId: string,
  displayOrder: number,
  fileName: string,
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${userId}/${reviewId}/${displayOrder}-${safeName}`;
}

export async function uploadReviewImages(
  userId: string,
  reviewId: string,
  images: File[],
  startOrder = 0,
): Promise<{ error: string | null }> {
  if (images.length === 0) {
    return { error: null };
  }

  const supabase = await createClient();

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    const storagePath = buildStoragePath(
      userId,
      reviewId,
      startOrder + index,
      image.name,
    );

    const { error: uploadError } = await supabase.storage
      .from(REVIEW_IMAGES_BUCKET)
      .upload(storagePath, image, {
        contentType: image.type,
        upsert: false,
      });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { error: insertError } = await supabase.from("review_images").insert({
      review_id: reviewId,
      storage_path: storagePath,
      display_order: startOrder + index,
    } as never);

    if (insertError) {
      return { error: insertError.message };
    }
  }

  return { error: null };
}
