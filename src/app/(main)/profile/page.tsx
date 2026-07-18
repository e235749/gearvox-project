import Link from "next/link";

import { ReviewListCard } from "@/components/reviews/review-list-card";
import { signOut } from "@/lib/auth/actions";
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
