"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { GearSelector } from "@/components/reviews/gear-selector";
import { ImageUploadInput } from "@/components/reviews/image-upload-input";
import { StarRatingInput } from "@/components/reviews/star-rating-input";
import { createReview } from "@/lib/reviews/actions";
import type { GearListItem } from "@/lib/gears/types";

interface NewReviewFormProps {
  gears: GearListItem[];
}

export function NewReviewForm({ gears }: NewReviewFormProps) {
  const router = useRouter();
  const [selectedGearId, setSelectedGearId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const canSubmit = selectedGearId !== null && rating >= 1;

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsPending(true);

    try {
      const result = await createReview(null, formData);

      if (process.env.NODE_ENV === "development") {
        console.info("[NewReviewForm] result", result);
      }

      if (result.success && result.reviewId) {
        router.push(`/reviews/${result.reviewId}`);
        return;
      }

      setError(result.error ?? "投稿に失敗しました。");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error ? <AuthAlert message={error} /> : null}

      <input type="hidden" name="gear_id" value={selectedGearId ?? ""} />
      <input
        type="hidden"
        name="rating"
        value={rating >= 1 ? String(rating) : ""}
      />

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">ギア選択</legend>
        <GearSelector
          gears={gears}
          selectedGearId={selectedGearId}
          onSelect={setSelectedGearId}
        />
      </fieldset>

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
          placeholder="使ってみた感想を書いてください"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
        />
      </div>

      <ImageUploadInput />

      <button
        type="submit"
        disabled={!canSubmit || isPending}
        className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "投稿中..." : "レビューを投稿"}
      </button>
    </form>
  );
}
