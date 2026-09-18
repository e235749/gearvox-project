import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ReviewFeedList } from "@/components/reviews/review-feed-list";
import { HOME_FEED_LIMIT } from "@/lib/reviews/constants";
import { loadEngagementsForReviews } from "@/lib/reviews/get-review-engagements";
import { listReviewsByUserId } from "@/lib/reviews/list-user-reviews";
import { loadSimilarityDisplaysForReviewAuthors } from "@/lib/similarity/load-review-author-similarities";
import {
  getVisibleUserProfile,
} from "@/lib/users/get-public-profile";
import { createClient } from "@/lib/supabase/server";

interface UserReviewsPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function UserReviewsPage({ params }: UserReviewsPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id === id) {
    redirect("/profile/reviews");
  }

  const profile = await getVisibleUserProfile(id);
  if (!profile) {
    notFound();
  }

  const reviews = await listReviewsByUserId(id, HOME_FEED_LIMIT, 0);
  const engagements = await loadEngagementsForReviews(reviews, user?.id);
  const authorSimilarities = await loadSimilarityDisplaysForReviewAuthors(
    user?.id,
    reviews.map((review) => review.author.id),
  );

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-muted">プロフィール</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {profile.display_name} の投稿一覧
        </h1>
        <Link
          href={`/users/${id}`}
          className="text-sm text-accent hover:underline"
        >
          プロフィールに戻る
        </Link>
      </header>

      <ReviewFeedList
        initialReviews={reviews}
        initialEngagements={engagements}
        initialAuthorSimilarities={authorSimilarities}
        currentUserId={user?.id ?? null}
        source={{ type: "user", userId: id }}
        showAuthor={false}
        emptyMessage={
          <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
            まだレビューを投稿していません。
          </div>
        }
      />
    </section>
  );
}
