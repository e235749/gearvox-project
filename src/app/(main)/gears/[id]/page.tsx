import Link from "next/link";
import { notFound } from "next/navigation";

import { formatGearLabel } from "@/lib/gears/format-gear-label";
import { getGearById } from "@/lib/gears/get-gear";
import {
  getGearReviewStats,
  listReviewsByGearId,
} from "@/lib/gears/list-gear-reviews";

interface GearDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatReviewHeadline(
  title: string | null,
  body: string,
): string {
  if (title?.trim()) {
    return title;
  }
  const trimmed = body.trim();
  if (trimmed.length <= 80) {
    return trimmed;
  }
  return `${trimmed.slice(0, 80)}…`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const dynamic = "force-dynamic";

export default async function GearDetailPage({ params }: GearDetailPageProps) {
  const { id } = await params;
  const [gear, reviews, stats] = await Promise.all([
    getGearById(id),
    listReviewsByGearId(id),
    getGearReviewStats(id),
  ]);

  if (!gear) {
    notFound();
  }

  const gearLabel = formatGearLabel(gear.name, gear.brand);

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <p className="text-sm text-muted">ギア詳細</p>
        <div className="flex gap-4">
          {gear.image_url ? (
            <img
              src={gear.image_url}
              alt=""
              width={96}
              height={96}
              className="h-24 w-24 rounded-lg object-cover"
            />
          ) : (
            <span className="flex h-24 w-24 items-center justify-center rounded-lg bg-surface text-sm text-muted">
              Gear
            </span>
          )}
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {gear.name}
            </h1>
            {gear.brand ? (
              <p className="text-sm text-muted">{gear.brand}</p>
            ) : null}
            {gear.category ? (
              <Link
                href={`/search?category=${gear.category.id}`}
                className="inline-block rounded-full border border-border px-2 py-0.5 text-xs text-muted transition-colors hover:border-accent/50 hover:text-accent"
              >
                {gear.category.name}
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-surface p-4 text-sm">
        <div>
          <dt className="text-muted">平均評価</dt>
          <dd className="text-lg font-medium text-accent">
            {stats.averageRating !== null
              ? `${stats.averageRating.toFixed(1)} / 5`
              : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">レビュー件数</dt>
          <dd className="text-lg font-medium">{stats.count} 件</dd>
        </div>
      </dl>

      {gear.description ? (
        <div className="rounded-lg border border-border bg-surface p-4 text-sm">
          <p className="mb-2 text-muted">説明</p>
          <p className="whitespace-pre-wrap leading-relaxed">{gear.description}</p>
        </div>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">レビュー</h2>
        {reviews.length === 0 ? (
          <div className="space-y-3 rounded-lg border border-border bg-surface p-4 text-sm">
            <p className="text-muted">まだレビューがありません。</p>
            <Link
              href="/reviews/new"
              className="inline-block text-accent hover:underline"
            >
              {gearLabel} のレビューを投稿する
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {reviews.map((review) => (
              <li key={review.id}>
                <Link
                  href={`/reviews/${review.id}`}
                  className="block rounded-lg border border-border bg-surface px-4 py-3 text-sm transition-colors hover:border-accent/50"
                >
                  <p className="font-medium">
                    {formatReviewHeadline(review.title, review.body)}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {review.author.display_name} ・ {review.rating} / 5 ・{" "}
                    {formatDate(review.created_at)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
