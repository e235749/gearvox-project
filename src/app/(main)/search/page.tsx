import { GearSearch } from "@/components/gears/gear-search";
import { listGearCategories } from "@/lib/gears/list-gear-categories";
import { listGears } from "@/lib/gears/list-gears";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { category } = await searchParams;
  const [gears, categories] = await Promise.all([
    listGears(),
    listGearCategories(),
  ]);

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm text-muted">探す</p>
        <h1 className="text-2xl font-semibold tracking-tight">ギア検索</h1>
      </header>
      <GearSearch
        gears={gears}
        categories={categories}
        initialCategoryId={category ?? null}
      />
    </section>
  );
}
