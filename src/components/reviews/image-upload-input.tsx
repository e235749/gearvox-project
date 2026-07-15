"use client";

import { MAX_REVIEW_IMAGES } from "@/lib/reviews/constants";

export function ImageUploadInput() {
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
        最大{MAX_REVIEW_IMAGES}枚・1枚5MBまで（JPEG / PNG / WebP / GIF）
      </p>
    </div>
  );
}
