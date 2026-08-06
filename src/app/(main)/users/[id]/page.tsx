import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { FollowButton } from "@/components/users/follow-button";
import { ReviewListCard } from "@/components/reviews/review-list-card";
import { formatContextSummaryLines } from "@/lib/context/format-context-summary";
import { getUserContextSummary } from "@/lib/context/get-user-context";
import { isFollowing } from "@/lib/follows/is-following";
import { listReviewsByUserId } from "@/lib/reviews/list-user-reviews";
import {
  buildInstagramProfileUrl,
  formatInstagramDisplay,
} from "@/lib/users/format-instagram-username";
import {
  getVisibleUserProfile,
  isProfilePrivate,
} from "@/lib/users/get-public-profile";
import { createClient } from "@/lib/supabase/server";

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id === id) {
    redirect("/profile");
  }

  const profile = await getVisibleUserProfile(id);

  if (!profile) {
    notFound();
  }

  const [reviews, following, contextSummary] = await Promise.all([
    listReviewsByUserId(id),
    user ? isFollowing(user.id, id) : Promise.resolve(false),
    !isProfilePrivate(profile) && profile.is_context_public
      ? getUserContextSummary(id)
      : Promise.resolve(null),
  ]);

  const contextLines =
    contextSummary?.isCompleted && contextSummary
      ? formatContextSummaryLines(contextSummary)
      : [];

  return (
    <section className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-muted">プロフィール</p>
          <div className="flex items-center gap-4">
            {!isProfilePrivate(profile) && profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-sm text-muted">
                —
              </span>
            )}
            <h1 className="text-2xl font-semibold tracking-tight">
              {profile.display_name}
            </h1>
          </div>
        </div>
        {user ? (
          <FollowButton targetUserId={id} initialIsFollowing={following} />
        ) : null}
      </header>

      {isProfilePrivate(profile) ? (
        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
          プロフィールは非公開に設定されています。
        </div>
      ) : (
        <dl className="space-y-3 rounded-lg border border-border bg-surface p-4 text-sm">
          <div>
            <dt className="text-muted">居住地</dt>
            <dd>{profile.location ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Instagram</dt>
            <dd>
              {profile.instagram_username ? (
                <a
                  href={buildInstagramProfileUrl(profile.instagram_username)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  {formatInstagramDisplay(profile.instagram_username)}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-muted">自己紹介</dt>
            <dd className="whitespace-pre-wrap">{profile.bio ?? "—"}</dd>
          </div>
        </dl>
      )}

      {!isProfilePrivate(profile) && contextLines.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">キャンプスタイル</h2>
          <dl className="space-y-3 rounded-lg border border-border bg-surface p-4 text-sm">
            {contextLines.map((line) => (
              <div key={line.label}>
                <dt className="text-muted">{line.label}</dt>
                <dd>{line.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">投稿したレビュー</h2>

        {reviews.length > 0 ? (
          <ul className="space-y-3">
            {reviews.map((review) => (
              <ReviewListCard
                key={review.id}
                review={review}
                gear={review.gear}
                showAuthor={false}
              />
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
            まだレビューを投稿していません。
          </div>
        )}
      </section>

      <Link href="/" className="text-sm text-accent hover:underline">
        ホームに戻る
      </Link>
    </section>
  );
}
