import Link from "next/link";

import type { ReviewListImage } from "@/lib/reviews/map-review-images";
import { getReviewImagePublicUrl } from "@/lib/reviews/review-image-url";

interface ReviewImageStripProps {
  reviewId: string;
  images: ReviewListImage[];
}

export function ReviewImageStrip({ reviewId, images }: ReviewImageStripProps) {
  if (images.length === 0) {
    return null;
  }

  if (images.length === 1) {
    const image = images[0];
    return (
      <Link
        href={`/reviews/${reviewId}`}
        className="block overflow-hidden rounded-lg"
      >
        <img
          src={getReviewImagePublicUrl(image.storage_path)}
          alt=""
          className="aspect-[4/3] w-full object-cover"
        />
      </Link>
    );
  }

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {images.map((image) => (
        <Link
          key={image.id}
          href={`/reviews/${reviewId}`}
          className="shrink-0 overflow-hidden rounded-lg"
        >
          <img
            src={getReviewImagePublicUrl(image.storage_path)}
            alt=""
            width={176}
            height={176}
            className="h-44 w-44 object-cover"
          />
        </Link>
      ))}
    </div>
  );
}
