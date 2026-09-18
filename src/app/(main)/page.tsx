import { Suspense } from "react";
import Link from "next/link";

import { ContextPromptBanner } from "@/components/context/context-prompt-banner";
import { FollowingReviewsPanel } from "@/components/home/following-reviews-panel";
import { HomeFeedTabs } from "@/components/home/home-feed-tabs";
import { HomeSimpleSearch } from "@/components/home/home-simple-search";
import { ReviewFeedList } from "@/components/reviews/review-feed-list";
import { hasCompletedContextQuestionnaire } from "@/lib/context/get-user-context";
import { listFollowingIds } from "@/lib/follows/is-following";
import { listGearCategories } from "@/lib/gears/list-gear-categories";
import {
  HOME_FEED_LIMIT,
  parseHomeFeedTab,
  type HomeFeedTab,
} from "@/lib/reviews/constants";
import { loadEngagementsForReviews } from "@/lib/reviews/get-review-engagements";
import {
  listDistinctGearBrands,
  listFilteredFeedReviews,
} from "@/lib/reviews/list-filtered-feed-reviews";
import { listFollowingReviews } from "@/lib/reviews/list-following-reviews";
import { loadSimilarityDisplaysForReviewAuthors } from "@/lib/similarity/load-review-author-similarities";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ tab?: string; category?: string; brand?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { tab, category, brand } = await searchParams;
  const activeTab: HomeFeedTab = parseHomeFeedTab(tab);
  const categoryId = category?.trim() || null;
  const brandFilter = brand?.trim() || null;
  const hasSimpleFilter = Boolean(categoryId || brandFilter);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [categories, brands, showContextPrompt] = await Promise.all([
    listGearCategories(),
    listDistinctGearBrands(),
    user ? hasCompletedContextQuestionnaire(user.id).then((done) => !done) : false,
  ]);

  const [latestOrFiltered, followingReviews, followingIds] = await Promise.all([
    activeTab === "latest"
      ? listFilteredFeedReviews({
          categoryId,
          brand: brandFilter,
          limit: HOME_FEED_LIMIT,
          offset: 0,
        })
      : Promise.resolve([]),
    activeTab === "following" && user
      ? listFollowingReviews(user.id, HOME_FEED_LIMIT, 0)
      : Promise.resolve([]),
    activeTab === "following" && user
      ? listFollowingIds(user.id)
      : Promise.resolve([]),
  ]);

  const activeReviews =
    activeTab === "latest" ? latestOrFiltered : followingReviews;
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

      <Suspense fallback={null}>
        <HomeSimpleSearch categories={categories} brands={brands} />
      </Suspense>

      <HomeFeedTabs
        activeTab={activeTab}
        categoryId={categoryId}
        brand={brandFilter}
      />

      <ContextPromptBanner show={showContextPrompt} />

      {activeTab === "latest" ? (
        <div className="space-y-3">
          {hasSimpleFilter ? (
            <p className="text-xs text-muted">
              簡単検索の条件でレビューを表示しています
              {categoryId
                ? `（カテゴリ: ${categories.find((item) => item.id === categoryId)?.name ?? "選択中"}）`
                : ""}
              {brandFilter ? `（ブランド: ${brandFilter}）` : ""}
            </p>
          ) : null}
          <ReviewFeedList
            initialReviews={latestOrFiltered}
            initialEngagements={engagements}
            initialAuthorSimilarities={authorSimilarities}
            currentUserId={user?.id ?? null}
            source={{
              type: "filtered",
              categoryId,
              brand: brandFilter,
            }}
            emptyMessage={
              <div className="space-y-3 rounded-lg border border-border bg-surface p-4 text-sm">
                <p className="text-muted">
                  {hasSimpleFilter
                    ? "条件に一致するレビューがありません。"
                    : "まだレビューがありません。"}
                </p>
                <Link href="/reviews/new" className="text-accent hover:underline">
                  レビューを投稿する
                </Link>
              </div>
            }
          />
        </div>
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
