import { ContextPromptBanner } from "@/components/context/context-prompt-banner";
import { FollowingReviewsPanel } from "@/components/home/following-reviews-panel";
import { HomeFeedTabs } from "@/components/home/home-feed-tabs";
import { LatestReviewsPanel } from "@/components/home/latest-reviews-panel";
import { hasCompletedContextQuestionnaire } from "@/lib/context/get-user-context";
import { listFollowingIds } from "@/lib/follows/is-following";
import {
  parseHomeFeedTab,
  type HomeFeedTab,
} from "@/lib/reviews/constants";
import { loadEngagementsForReviews } from "@/lib/reviews/get-review-engagements";
import { listFollowingReviews } from "@/lib/reviews/list-following-reviews";
import { listLatestReviews } from "@/lib/reviews/list-latest-reviews";
import { loadSimilarityDisplaysForReviewAuthors } from "@/lib/similarity/load-review-author-similarities";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { tab } = await searchParams;
  const activeTab: HomeFeedTab = parseHomeFeedTab(tab);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [latestReviews, followingReviews, followingIds, showContextPrompt] =
    await Promise.all([
    activeTab === "latest" ? listLatestReviews() : Promise.resolve([]),
    activeTab === "following" && user
      ? listFollowingReviews(user.id)
      : Promise.resolve([]),
    activeTab === "following" && user
      ? listFollowingIds(user.id)
      : Promise.resolve([]),
    user ? hasCompletedContextQuestionnaire(user.id).then((done) => !done) : false,
  ]);

  const activeReviews =
    activeTab === "latest" ? latestReviews : followingReviews;
  const engagements = await loadEngagementsForReviews(activeReviews, user?.id);
  const authorSimilarities = await loadSimilarityDisplaysForReviewAuthors(
    user?.id,
    activeReviews.map((review) => review.author.id),
  );

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm text-muted">GearVox</p>
        <h1 className="text-2xl font-semibold tracking-tight">ホーム</h1>
      </header>

      <HomeFeedTabs activeTab={activeTab} />

      <ContextPromptBanner show={showContextPrompt} />

      {activeTab === "latest" ? (
        <LatestReviewsPanel
          reviews={latestReviews}
          engagements={engagements}
          authorSimilarities={authorSimilarities}
          currentUserId={user?.id ?? null}
        />
      ) : (
        <FollowingReviewsPanel
          reviews={followingReviews}
          followingCount={followingIds.length}
          engagements={engagements}
          authorSimilarities={authorSimilarities}
          currentUserId={user?.id ?? null}
        />
      )}
    </section>
  );
}
