"use client";

import {
  MAX_IMAGE_SIZE_MB,
  MAX_REVIEW_IMAGES,
  REVIEW_IMAGE_ACCEPT,
} from "@/lib/reviews/constants";
import { getReviewImageFormatLabel } from "@/lib/reviews/image-file";

interface ImageUploadInputProps {
  remainingSlots?: number;
}

export function ImageUploadInput({ remainingSlots }: ImageUploadInputProps) {
  const maxImages = remainingSlots ?? MAX_REVIEW_IMAGES;

  if (maxImages <= 0) {
    return (
      <p className="text-xs text-muted">
        画像は最大{MAX_REVIEW_IMAGES}枚まで添付できます。
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="images" className="text-sm text-muted">
        画像（任意）
      </label>
      <input
        id="images"
        name="images"
        type="file"
        accept={REVIEW_IMAGE_ACCEPT}
        multiple
        className="block w-full text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-background"
      />
      <p className="text-xs text-muted">
        {remainingSlots !== undefined
          ? `あと${maxImages}枚まで追加できます（1枚${MAX_IMAGE_SIZE_MB}MBまで）`
          : `最大${maxImages}枚・1枚${MAX_IMAGE_SIZE_MB}MBまで（${getReviewImageFormatLabel()}）`}
        {" "}
        iPhoneの写真（HEIC）は自動でJPEGに変換されます。
      </p>
    </div>
  );
}
