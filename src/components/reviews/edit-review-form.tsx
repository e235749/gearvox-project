"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { ImageUploadInput } from "@/components/reviews/image-upload-input";
import { StarRatingInput } from "@/components/reviews/star-rating-input";
import { MAX_REVIEW_IMAGES } from "@/lib/reviews/constants";
import { updateReview } from "@/lib/reviews/actions";
import { getReviewImagePublicUrl } from "@/lib/reviews/review-image-url";
import type { ReviewDetail } from "@/lib/reviews/types";
import { formatGearLabel } from "@/lib/gears/format-gear-label";

interface EditReviewFormProps {
  review: ReviewDetail;
}

export function EditReviewForm({ review }: EditReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(review.rating);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const gearLabel = formatGearLabel(review.gear.name, review.gear.brand);
  const remainingImageSlots = MAX_REVIEW_IMAGES - review.images.length;
  const canSubmit = rating >= 1;

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsPending(true);

    try {
      const result = await updateReview(null, formData);

      if (result.success && result.reviewId) {
        router.push(`/reviews/${result.reviewId}`);
        router.refresh();
        return;
      }

      setError(result.error ?? "更新に失敗しました。");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error ? <AuthAlert message={error} /> : null}

      <input type="hidden" name="review_id" value={review.id} />
      <input
        type="hidden"
        name="rating"
        value={rating >= 1 ? String(rating) : ""}
      />

      <div className="space-y-2 rounded-lg border border-border bg-surface p-4 text-sm">
        <p className="text-muted">対象ギア</p>
        <p className="font-medium">{gearLabel}</p>
      </div>

      <StarRatingInput value={rating} onChange={setRating} />

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm text-muted">
          タイトル（任意）
        </label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={100}
          defaultValue={review.title ?? ""}
          placeholder="レビューのタイトル"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="body" className="text-sm text-muted">
          レビュー本文
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={6}
          maxLength={5000}
          defaultValue={review.body}
          placeholder="使ってみた感想を書いてください"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
        />
      </div>

      {review.images.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-muted">登録済みの画像</p>
          <div className="grid grid-cols-2 gap-3">
            {review.images.map((image) => (
              <img
                key={image.id}
                src={getReviewImagePublicUrl(image.storage_path)}
                alt=""
                className="aspect-square w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </div>
      ) : null}

      <ImageUploadInput remainingSlots={remainingImageSlots} />

      <button
        type="submit"
        disabled={!canSubmit || isPending}
        className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "保存中..." : "変更を保存"}
      </button>
    </form>
  );
}
