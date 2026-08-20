"use client";

import { useMemo, useState } from "react";

import { GearListItemCard } from "@/components/gears/gear-list-item";
import { filterGears } from "@/lib/gears/filter-gears";
import type { GearCategoryItem, GearListItem } from "@/lib/gears/types";

interface GearSearchProps {
  gears: GearListItem[];
  categories: GearCategoryItem[];
  initialCategoryId?: string | null;
}

function resolveInitialCategoryId(
  categories: GearCategoryItem[],
  initialCategoryId: string | null | undefined,
): string | null {
  if (!initialCategoryId) {
    return null;
  }
  return categories.some((category) => category.id === initialCategoryId)
    ? initialCategoryId
    : null;
}

function getCategoryById(
  categories: GearCategoryItem[],
  categoryId: string | null,
): GearCategoryItem | null {
  if (!categoryId) {
    return null;
  }
  return categories.find((category) => category.id === categoryId) ?? null;
}

function getInitialKeyword(
  categories: GearCategoryItem[],
  categoryId: string | null,
): string {
  return getCategoryById(categories, categoryId)?.name ?? "";
}

function findCategoryByName(
  categories: GearCategoryItem[],
  keyword: string,
): GearCategoryItem | null {
  const normalized = keyword.trim();
  if (!normalized) {
    return null;
  }
  return categories.find((category) => category.name === normalized) ?? null;
}

export function GearSearch({
  gears,
  categories,
  initialCategoryId,
}: GearSearchProps) {
  const initialCategoryIdResolved = resolveInitialCategoryId(
    categories,
    initialCategoryId,
  );
  const [keyword, setKeyword] = useState(() =>
    getInitialKeyword(categories, initialCategoryIdResolved),
  );
  const [categoryId, setCategoryId] = useState<string | null>(
    initialCategoryIdResolved,
  );

  const filteredGears = useMemo(
    () => filterGears(gears, keyword, categoryId),
    [gears, keyword, categoryId],
  );

  function handleKeywordChange(value: string) {
    setKeyword(value);

    const matchedCategory = findCategoryByName(categories, value);
    if (matchedCategory) {
      setCategoryId(matchedCategory.id);
      return;
    }

    const selectedCategory = getCategoryById(categories, categoryId);
    if (selectedCategory && value.trim() !== selectedCategory.name) {
      setCategoryId(null);
    }
  }

  function handleSelectAll() {
    setCategoryId(null);
    setKeyword((current) => {
      if (findCategoryByName(categories, current)) {
        return "";
      }
      return current;
    });
  }

  function handleSelectCategory(category: GearCategoryItem) {
    setCategoryId(category.id);
    setKeyword(category.name);
  }

  if (gears.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
        登録されているギアがありません。Supabase管理画面の Table Editor で
        gears を追加してください。
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="gear-search-keyword" className="text-sm text-muted">
          キーワード
        </label>
        <input
          id="gear-search-keyword"
          type="search"
          value={keyword}
          onChange={(event) => handleKeywordChange(event.target.value)}
          placeholder="ギア名・ブランド名・カテゴリ"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
        />
      </div>

      {categories.length > 0 ? (
        <div className="space-y-2">
          <span className="text-sm text-muted">カテゴリ</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                categoryId === null
                  ? "border-accent bg-accent/20 text-accent"
                  : "border-border bg-surface text-muted hover:border-accent/50"
              }`}
            >
              すべて
            </button>
            {categories.map((category) => {
              const isSelected = categoryId === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelectCategory(category)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    isSelected
                      ? "border-accent bg-accent/20 text-accent"
                      : "border-border bg-surface text-muted hover:border-accent/50"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <p className="text-sm text-muted">{filteredGears.length} 件のギア</p>

      <ul className="space-y-2">
        {filteredGears.length === 0 ? (
          <li className="rounded-lg border border-border px-4 py-3 text-sm text-muted">
            該当するギアが見つかりません。
          </li>
        ) : (
          filteredGears.map((gear) => (
            <GearListItemCard key={gear.id} gear={gear} />
          ))
        )}
      </ul>
    </div>
  );
}
