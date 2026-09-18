"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import type { GearCategoryItem } from "@/lib/gears/types";

interface HomeSimpleSearchProps {
  categories: GearCategoryItem[];
  brands: string[];
}

export function HomeSimpleSearch({
  categories,
  brands,
}: HomeSimpleSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedCategoryId = searchParams.get("category") ?? "";
  const selectedBrand = searchParams.get("brand") ?? "";

  const hasFilter = Boolean(selectedCategoryId || selectedBrand);

  function pushFilters(next: {
    category?: string;
    brand?: string;
    clearAll?: boolean;
  }) {
    const params = new URLSearchParams();

    if (!next.clearAll) {
      const category =
        next.category !== undefined ? next.category : selectedCategoryId;
      const brand = next.brand !== undefined ? next.brand : selectedBrand;

      if (category) {
        params.set("category", category);
      }
      if (brand) {
        params.set("brand", brand);
      }
    }

    // 簡単検索の結果は常に「新着」タブで表示（AND 絞り込み対象）
    params.set("tab", "latest");

    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/?${qs}` : "/?tab=latest");
      router.refresh();
    });
  }

  return (
    <section className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">簡単検索</h2>
          <p className="text-xs text-muted">
            カテゴリとブランドは両方指定すると AND（両方一致）で絞り込みます。片方だけでも検索できます。
          </p>
        </div>
        {hasFilter ? (
          <button
            type="button"
            onClick={() => pushFilters({ clearAll: true })}
            disabled={isPending}
            className="shrink-0 text-xs text-accent hover:underline disabled:opacity-60"
          >
            解除
          </button>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted">カテゴリ</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => pushFilters({ category: "" })}
            disabled={isPending}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              !selectedCategoryId
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:border-accent/50 hover:text-accent"
            }`}
          >
            すべて
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => pushFilters({ category: category.id })}
              disabled={isPending}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                selectedCategoryId === category.id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-muted hover:border-accent/50 hover:text-accent"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {brands.length > 0 ? (
        <div className="space-y-2">
          <label htmlFor="home-brand-filter" className="text-xs text-muted">
            ブランド
          </label>
          <select
            id="home-brand-filter"
            value={selectedBrand}
            disabled={isPending}
            onChange={(event) => pushFilters({ brand: event.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="">すべて</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </section>
  );
}
