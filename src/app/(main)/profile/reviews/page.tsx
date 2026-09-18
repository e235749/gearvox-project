import Link from "next/link";
import { redirect } from "next/navigation";

import { ReviewFeedList } from "@/components/reviews/review-feed-list";
import { HOME_FEED_LIMIT } from "@/lib/reviews/constants";
import { loadEngagementsForReviews } from "@/lib/reviews/get-review-engagements";
import { listReviewsByUserId } from "@/lib/reviews/list-user-reviews";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfileReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile/reviews");
  }

  const reviews = await listReviewsByUserId(user.id, HOME_FEED_LIMIT, 0);
  const engagements = await loadEngagementsForReviews(reviews, user.id);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-muted">マイページ</p>
        <h1 className="text-2xl font-semibold tracking-tight">投稿一覧</h1>
        <Link href="/profile" className="text-sm text-accent hover:underline">
          マイページに戻る
        </Link>
      </header>

      <ReviewFeedList
        initialReviews={reviews}
        initialEngagements={engagements}
        initialAuthorSimilarities={{}}
        currentUserId={user.id}
        source={{ type: "user", userId: user.id }}
        showAuthor={false}
        emptyMessage={
          <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
            <p>まだレビューを投稿していません。</p>
            <Link
              href="/reviews/new"
              className="mt-2 inline-block text-accent hover:underline"
            >
              最初のレビューを投稿する
            </Link>
          </div>
        }
      />
    </section>
  );
}
