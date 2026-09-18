"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";

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

  const queryString = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    return params;
  }, [searchParams]);

  function updateFilter(next: { category?: string; brand?: string }) {
    const params = new URLSearchParams(queryString.toString());

    if (next.category !== undefined) {
      if (next.category) {
        params.set("category", next.category);
      } else {
        params.delete("category");
      }
    }

    if (next.brand !== undefined) {
      if (next.brand) {
        params.set("brand", next.brand);
      } else {
        params.delete("brand");
      }
    }

    // フィルタ変更時は新着タブを維持しつつ following 指定は残す
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/?${qs}` : "/");
    });
  }

  function clearFilters() {
    const params = new URLSearchParams();
    const tab = searchParams.get("tab");
    if (tab === "following") {
      params.set("tab", "following");
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/?${qs}` : "/");
    });
  }

  return (
    <section className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">簡単検索</h2>
          <p className="text-xs text-muted">
            カテゴリやブランドで、表示するレビューを絞り込めます
          </p>
        </div>
        {hasFilter ? (
          <button
            type="button"
            onClick={clearFilters}
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
            onClick={() => updateFilter({ category: "" })}
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
              onClick={() => updateFilter({ category: category.id })}
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
            onChange={(event) => updateFilter({ brand: event.target.value })}
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
