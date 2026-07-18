"use client";

import { MAX_REVIEW_IMAGES } from "@/lib/reviews/constants";

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
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="block w-full text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-background"
      />
      <p className="text-xs text-muted">
        {remainingSlots !== undefined
          ? `あと${maxImages}枚まで追加できます（1枚5MBまで）`
          : `最大${maxImages}枚・1枚5MBまで（JPEG / PNG / WebP / GIF）`}
      </p>
    </div>
  );
}
