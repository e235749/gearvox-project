import Link from "next/link";

import { formatGearLabel } from "@/lib/gears/format-gear-label";
import {
  formatReviewDate,
  formatReviewHeadline,
} from "@/lib/reviews/format-review-label";
import type { FeedReviewListItem } from "@/lib/reviews/types";

interface ReviewFeedCardProps {
  review: FeedReviewListItem;
}

export function ReviewFeedCard({ review }: ReviewFeedCardProps) {
  const gearLabel = formatGearLabel(review.gear.name, review.gear.brand);

  return (
    <li className="rounded-lg border border-border bg-surface px-4 py-3 text-sm">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <p className="font-medium">{review.author.display_name}</p>
          <p className="shrink-0 text-xs text-muted">{review.rating} / 5</p>
        </div>
        <p className="text-xs text-muted">
          <Link
            href={`/gears/${review.gear.id}`}
            className="text-accent hover:underline"
          >
            {gearLabel}
          </Link>
          {" ・ "}
          {formatReviewDate(review.created_at)}
        </p>
        <Link
          href={`/reviews/${review.id}`}
          className="block leading-relaxed transition-colors hover:text-accent"
        >
          {formatReviewHeadline(review.title, review.body)}
        </Link>
      </div>
    </li>
  );
}
