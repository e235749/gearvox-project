import Link from "next/link";

import { ContextPrivacyToggle } from "@/components/profile/context-privacy-toggle";
import { ReviewListCard } from "@/components/reviews/review-list-card";
import { BlockedUsersList } from "@/components/users/blocked-users-list";
import { SimilarUsersSection } from "@/components/similarity/similar-users-section";
import { signOut } from "@/lib/auth/actions";
import { listBlockedUsers } from "@/lib/blocks/list-blocked-users";
import { listSimilarUsersForProfile } from "@/lib/similarity/list-similar-users";
import { formatContextSummaryLines } from "@/lib/context/format-context-summary";
import { getUserContextSummary } from "@/lib/context/get-user-context";
import { loadEngagementsForReviews } from "@/lib/reviews/get-review-engagements";
import { listReviewsByUserId } from "@/lib/reviews/list-user-reviews";
import { createClient } from "@/lib/supabase/server";
import {
  buildInstagramProfileUrl,
  formatInstagramDisplay,
} from "@/lib/users/format-instagram-username";
import { getUserProfile } from "@/lib/users/get-profile";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await getUserProfile(user.id) : null;
  const reviews = user ? await listReviewsByUserId(user.id) : [];
  const blockedUsers = user ? await listBlockedUsers() : [];
  const similarUsers = user ? await listSimilarUsersForProfile(user.id) : [];
  const engagements = await loadEngagementsForReviews(reviews, user?.id);
  const contextSummary = user ? await getUserContextSummary(user.id) : null;
  const contextLines = contextSummary
    ? formatContextSummaryLines(contextSummary)
    : [];

  return (
    <section className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-muted">マイページ</p>
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
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
              {profile?.display_name ?? "プロフィール"}
            </h1>
          </div>
        </div>
        <Link
          href="/profile/edit"
          className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          編集
        </Link>
      </header>

      <dl className="space-y-3 rounded-lg border border-border bg-surface p-4 text-sm">
        <div>
          <dt className="text-muted">メールアドレス</dt>
          <dd>{profile?.email ?? user?.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">プロフィール公開</dt>
          <dd>{profile?.is_public === false ? "非公開" : "公開"}</dd>
        </div>
        <div>
          <dt className="text-muted">キャンプスタイル公開</dt>
          <dd>{profile?.is_context_public === false ? "非公開" : "公開"}</dd>
        </div>
        <div>
          <dt className="text-muted">居住地</dt>
          <dd>{profile?.location ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Instagram</dt>
          <dd>
            {profile?.instagram_username ? (
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
          <dd className="whitespace-pre-wrap">{profile?.bio ?? "—"}</dd>
        </div>
      </dl>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">キャンプスタイル</h2>
          <Link
            href="/profile/context"
            className="text-sm text-accent hover:underline"
          >
            {contextSummary?.isCompleted ? "編集" : "設定する"}
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <ContextPrivacyToggle
            initialIsPublic={profile?.is_context_public !== false}
          />
        </div>

        {contextSummary?.isCompleted ? (
          <dl className="space-y-3 rounded-lg border border-border bg-surface p-4 text-sm">
            {contextLines.map((line) => (
              <div key={line.label}>
                <dt className="text-muted">{line.label}</dt>
                <dd>{line.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
            <p>まだアンケートに回答していません。</p>
            <Link
              href="/profile/context?welcome=1"
              className="mt-2 inline-block text-accent hover:underline"
            >
              キャンプスタイルを設定する
            </Link>
          </div>
        )}
      </section>

      <SimilarUsersSection
        similarUsers={similarUsers}
        isContextCompleted={contextSummary?.isCompleted ?? false}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">投稿したレビュー</h2>
          <Link
            href="/reviews/new"
            className="text-sm text-accent hover:underline"
          >
            新規投稿
          </Link>
        </div>

        {reviews.length > 0 ? (
          <ul className="space-y-3">
            {reviews.map((review) => (
              <ReviewListCard
                key={review.id}
                review={review}
                gear={review.gear}
                showAuthor={false}
                engagement={engagements[review.id]}
                currentUserId={user?.id ?? null}
              />
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
            <p>まだレビューを投稿していません。</p>
            <Link
              href="/reviews/new"
              className="mt-2 inline-block text-accent hover:underline"
            >
              最初のレビューを投稿する
            </Link>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">ブロック中のユーザー</h2>
        <BlockedUsersList blockedUsers={blockedUsers} />
      </section>

      <form action={signOut}>
        <button
          type="submit"
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-red-500/50 hover:text-red-400"
        >
          ログアウト
        </button>
      </form>
    </section>
  );
}
