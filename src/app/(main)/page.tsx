import { FollowingReviewsPanel } from "@/components/home/following-reviews-panel";
import { HomeFeedTabs } from "@/components/home/home-feed-tabs";
import { LatestReviewsPanel } from "@/components/home/latest-reviews-panel";
import {
  parseHomeFeedTab,
  type HomeFeedTab,
} from "@/lib/reviews/constants";
import { listLatestReviews } from "@/lib/reviews/list-latest-reviews";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { tab } = await searchParams;
  const activeTab: HomeFeedTab = parseHomeFeedTab(tab);
  const latestReviews =
    activeTab === "latest" ? await listLatestReviews() : [];

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm text-muted">GearVox</p>
        <h1 className="text-2xl font-semibold tracking-tight">ホーム</h1>
      </header>

      <HomeFeedTabs activeTab={activeTab} />

      {activeTab === "latest" ? (
        <LatestReviewsPanel reviews={latestReviews} />
      ) : (
        <FollowingReviewsPanel />
      )}
    </section>
  );
}
