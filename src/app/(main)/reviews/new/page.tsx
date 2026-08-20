import { NewReviewForm } from "@/components/reviews/new-review-form";
import { listGearCategories } from "@/lib/gears/list-gear-categories";
import { listGears } from "@/lib/gears/list-gears";

export const dynamic = "force-dynamic";

export default async function NewReviewPage() {
  const [gears, categories] = await Promise.all([
    listGears(),
    listGearCategories(),
  ]);

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm text-muted">投稿</p>
        <h1 className="text-2xl font-semibold tracking-tight">レビュー投稿</h1>
      </header>
      <NewReviewForm gears={gears} categories={categories} />
    </section>
  );
}
