import Link from "next/link";

import { ReviewEngagement } from "@/components/reviews/review-engagement";
import { ReviewImageStrip } from "@/components/reviews/review-image-strip";
import { StarRating } from "@/components/reviews/star-rating";
import { SimilarityBadge } from "@/components/similarity/similarity-badge";
import { formatGearLabel } from "@/lib/gears/format-gear-label";
import { formatReviewDate } from "@/lib/reviews/format-review-label";
import type { ReviewEngagementSummary } from "@/lib/reviews/engagement-types";
import type { SimilarityDisplay } from "@/lib/similarity/types";
import type { ReviewListImage } from "@/lib/reviews/map-review-images";

interface ReviewListCardProps {
  review: {
    id: string;
    title: string | null;
    bodyPreview: string;
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
  engagement?: ReviewEngagementSummary;
  currentUserId?: string | null;
  authorSimilarity?: SimilarityDisplay | null;
}

export function ReviewListCard({
  review,
  gear,
  showAuthor = true,
  engagement,
  currentUserId = null,
  authorSimilarity = null,
}: ReviewListCardProps) {
  const engagementSummary = engagement ?? {
    reviewId: review.id,
    likeCount: 0,
    commentCount: 0,
    isLikedByUser: false,
  };

  const headline = review.title?.trim() || null;

  return (
    <li className="rounded-lg border border-border bg-surface px-4 py-3 text-sm">
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            {showAuthor ? (
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/users/${review.author.id}`}
                  className="font-medium transition-colors hover:text-accent"
                >
                  {review.author.display_name}
                </Link>
                <SimilarityBadge similarity={authorSimilarity} />
              </div>
            ) : (
              <span />
            )}
            <StarRating value={review.rating} size="sm" className="shrink-0" />
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
            className="block space-y-1 transition-colors hover:text-accent"
          >
            {headline ? (
              <p className="font-medium leading-relaxed">{headline}</p>
            ) : null}
            {review.bodyPreview ? (
              <p
                className={`leading-relaxed ${headline ? "text-muted" : ""}`}
              >
                {review.bodyPreview}
              </p>
            ) : null}
          </Link>
        </div>
        <ReviewImageStrip reviewId={review.id} images={review.images} />
        <ReviewEngagement
          reviewId={review.id}
          engagement={engagementSummary}
          currentUserId={currentUserId}
        />
      </div>
    </li>
  );
}
