import Link from "next/link";
import { notFound } from "next/navigation";

import { ReviewOwnerActions } from "@/components/reviews/review-owner-actions";
import { ReviewEngagement } from "@/components/reviews/review-engagement";
import {
  ReportDialog,
  ReportLoginPrompt,
} from "@/components/reports/report-dialog";
import { SimilarityBadge } from "@/components/similarity/similarity-badge";
import { BlockButton } from "@/components/users/block-button";
import { FollowButton } from "@/components/users/follow-button";
import { formatGearLabel } from "@/lib/gears/format-gear-label";
import { isFollowing } from "@/lib/follows/is-following";
import { getReviewById } from "@/lib/reviews/get-review";
import { getReviewEngagementSummaries } from "@/lib/reviews/get-review-engagements";
import { getSimilarityDisplayBetweenUsers } from "@/lib/similarity/get-similarity-display";
import { getReviewImagePublicUrl } from "@/lib/reviews/review-image-url";
import { createClient } from "@/lib/supabase/server";

interface ReviewDetailPageProps {
  params: Promise<{ id: string }>;
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === review.user_id;
  const following =
    user && !isOwner
      ? await isFollowing(user.id, review.user_id)
      : false;
  const engagements = await getReviewEngagementSummaries([review.id], user?.id);
  const engagement = engagements[review.id] ?? {
    reviewId: review.id,
    likeCount: 0,
    commentCount: 0,
    isLikedByUser: false,
  };

  let authorSimilarity = null;

  if (user && !isOwner) {
    const { data: authorProfile } = await supabase
      .from("users")
      .select("is_context_public")
      .eq("id", review.user_id)
      .maybeSingle();

    authorSimilarity = await getSimilarityDisplayBetweenUsers(
      user.id,
      review.user_id,
      (authorProfile as { is_context_public: boolean } | null)?.is_context_public !==
        false,
    );
  }

  const gearLabel = formatGearLabel(review.gear.name, review.gear.brand);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-muted">レビュー詳細</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {review.title ?? gearLabel}
        </h1>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <Link
              href={`/users/${review.author.id}`}
              className="font-medium text-foreground transition-colors hover:text-accent"
            >
              {review.author.display_name}
            </Link>
            <SimilarityBadge similarity={authorSimilarity} />
            <span>{review.rating} / 5</span>
          </div>
          {user && !isOwner ? (
            <div className="flex flex-col items-end gap-2">
              <FollowButton
                targetUserId={review.user_id}
                initialIsFollowing={following}
              />
              <BlockButton targetUserId={review.user_id} redirectOnBlock="/" />
            </div>
          ) : null}
        </div>
      </header>

      <div className="rounded-lg border border-border bg-surface p-4 text-sm">
        <p className="text-muted">対象ギア</p>
        <Link
          href={`/gears/${review.gear.id}`}
          className="font-medium text-accent hover:underline"
        >
          {gearLabel}
        </Link>
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

      <ReviewEngagement
        reviewId={review.id}
        engagement={engagement}
        currentUserId={user?.id ?? null}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        {user && !isOwner ? (
          <ReportDialog targetType="review" targetId={review.id} />
        ) : user ? null : (
          <ReportLoginPrompt />
        )}
      </div>

      {isOwner ? <ReviewOwnerActions reviewId={review.id} /> : null}

      <Link href="/reviews/new" className="text-sm text-accent hover:underline">
        別のレビューを投稿する
      </Link>
    </section>
  );
}
