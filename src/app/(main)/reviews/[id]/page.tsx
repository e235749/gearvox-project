import Link from "next/link";
import { notFound } from "next/navigation";

import { getReviewById } from "@/lib/reviews/get-review";
import { getReviewImagePublicUrl } from "@/lib/reviews/upload-review-images";

interface ReviewDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatGearLabel(name: string, brand: string | null): string {
  if (brand) {
    return `${brand} / ${name}`;
  }
  return name;
}

export const dynamic = "force-dynamic";

export default async function ReviewDetailPage({
  params,
}: ReviewDetailPageProps) {
  const { id } = await params;
  const review = await getReviewById(id);

  if (!review) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-muted">レビュー詳細</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {review.title ?? formatGearLabel(review.gear.name, review.gear.brand)}
        </h1>
        <p className="text-sm text-muted">
          {review.author.display_name} ・ {review.rating} / 5
        </p>
      </header>

      <div className="rounded-lg border border-border bg-surface p-4 text-sm">
        <p className="text-muted">対象ギア</p>
        <p className="font-medium">
          {formatGearLabel(review.gear.name, review.gear.brand)}
        </p>
      </div>

      <article className="space-y-3">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {review.body}
        </p>
      </article>

      {review.images.length > 0 ? (
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
      ) : null}

      <Link href="/reviews/new" className="text-sm text-accent hover:underline">
        別のレビューを投稿する
      </Link>
    </section>
  );
}
