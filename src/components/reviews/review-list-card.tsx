import Link from "next/link";

import { formatGearLabel } from "@/lib/gears/format-gear-label";
import { ReviewImageStrip } from "@/components/reviews/review-image-strip";
import {
  formatReviewDate,
  formatReviewHeadline,
} from "@/lib/reviews/format-review-label";
import type { ReviewListImage } from "@/lib/reviews/map-review-images";

interface ReviewListCardProps {
  review: {
    id: string;
    title: string | null;
    body: string;
    rating: number;
    created_at: string;
    author: {
      id: string;
      display_name: string;
    };
    images: ReviewListImage[];
  };
  gear?: {
    id: string;
    name: string;
    brand: string | null;
  };
  showAuthor?: boolean;
}

export function ReviewListCard({
  review,
  gear,
  showAuthor = true,
}: ReviewListCardProps) {
  return (
    <li className="rounded-lg border border-border bg-surface px-4 py-3 text-sm">
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            {showAuthor ? (
              <Link
                href={`/users/${review.author.id}`}
                className="font-medium transition-colors hover:text-accent"
              >
                {review.author.display_name}
              </Link>
            ) : (
              <span />
            )}
            <p className="shrink-0 text-xs text-muted">{review.rating} / 5</p>
          </div>
          <p className="text-xs text-muted">
            {gear ? (
              <>
                <Link
                  href={`/gears/${gear.id}`}
                  className="text-accent hover:underline"
                >
                  {formatGearLabel(gear.name, gear.brand)}
                </Link>
                {" ・ "}
              </>
            ) : null}
            {formatReviewDate(review.created_at)}
          </p>
          <Link
            href={`/reviews/${review.id}`}
            className="block leading-relaxed transition-colors hover:text-accent"
          >
            {formatReviewHeadline(review.title, review.body)}
          </Link>
        </div>
        <ReviewImageStrip reviewId={review.id} images={review.images} />
      </div>
    </li>
  );
}
