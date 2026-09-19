"use client";

import { createClient } from "@/lib/supabase/client";
import { MAX_REVIEW_IMAGES } from "@/lib/reviews/constants";

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

export type ClientUploadResult = {
  uploadedCount: number;
  error: string | null;
};

/**
 * ブラウザから Supabase Storage へ直接アップロードし、
 * review_images テーブルにメタデータを登録する。
 */
export async function uploadReviewImagesFromClient(
  reviewId: string,
  images: File[],
  startOrder = 0,
): Promise<ClientUploadResult> {
  if (images.length === 0) {
    return { uploadedCount: 0, error: null };
  }

  if (startOrder + images.length > MAX_REVIEW_IMAGES) {
    return {
      uploadedCount: 0,
      error: `画像は最大${MAX_REVIEW_IMAGES}枚まで添付できます。`,
    };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      uploadedCount: 0,
      error: "ログインが必要です。再ログインしてください。",
    };
  }

  let uploadedCount = 0;

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    const displayOrder = startOrder + index;
    const storagePath = buildStoragePath(
      user.id,
      reviewId,
      displayOrder,
      image.name,
    );

    const { error: uploadError } = await supabase.storage
      .from(REVIEW_IMAGES_BUCKET)
      .upload(storagePath, image, {
        contentType: image.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      return {
        uploadedCount,
        error: `画像のアップロードに失敗しました: ${uploadError.message}`,
      };
    }

    const { error: insertError } = await supabase.from("review_images").insert({
      review_id: reviewId,
      storage_path: storagePath,
      display_order: displayOrder,
    } as never);

    if (insertError) {
      // DB 登録失敗時は Storage 上のファイルを削除して整合性を保つ
      await supabase.storage.from(REVIEW_IMAGES_BUCKET).remove([storagePath]);
      return {
        uploadedCount,
        error: `画像情報の保存に失敗しました: ${insertError.message}`,
      };
    }

    uploadedCount += 1;
  }

  return { uploadedCount, error: null };
}
