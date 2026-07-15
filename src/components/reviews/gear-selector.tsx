"use client";

import { useMemo, useState } from "react";

import { formatGearLabel } from "@/lib/gears/format-gear-label";
import { filterGearsByKeyword } from "@/lib/gears/filter-gears";
import type { GearListItem } from "@/lib/gears/types";

interface GearSelectorProps {
  gears: GearListItem[];
  selectedGearId: string | null;
  onSelect: (gearId: string) => void;
}

export function GearSelector({
  gears,
  selectedGearId,
  onSelect,
}: GearSelectorProps) {
  const [keyword, setKeyword] = useState("");

  const filteredGears = useMemo(
    () => filterGearsByKeyword(gears, keyword),
    [gears, keyword],
  );

  const selectedGear = gears.find((gear) => gear.id === selectedGearId) ?? null;

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
        <label htmlFor="gear-search" className="text-sm text-muted">
          ギアを検索
        </label>
        <input
          id="gear-search"
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="ギア名・ブランド名"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
        />
      </div>

      {selectedGear ? (
        <div className="rounded-lg border border-accent/50 bg-accent/10 px-4 py-3 text-sm">
          <p className="text-muted">選択中</p>
          <p className="font-medium">
            {formatGearLabel(selectedGear.name, selectedGear.brand)}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted">レビューするギアを選択してください。</p>
      )}

      <ul className="max-h-72 space-y-2 overflow-y-auto">
        {filteredGears.length === 0 ? (
          <li className="rounded-lg border border-border px-4 py-3 text-sm text-muted">
            該当するギアが見つかりません。
          </li>
        ) : (
          filteredGears.map((gear) => {
            const isSelected = gear.id === selectedGearId;
            return (
              <li key={gear.id}>
                <button
                  type="button"
                  onClick={() => onSelect(gear.id)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    isSelected
                      ? "border-accent bg-accent/10"
                      : "border-border bg-surface hover:border-accent/50"
                  }`}
                >
                  {gear.image_url ? (
                    <img
                      src={gear.image_url}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-background text-xs text-muted">
                      Gear
                    </span>
                  )}
                  <span className="flex-1">
                    <span className="block font-medium">{gear.name}</span>
                    {gear.brand ? (
                      <span className="block text-xs text-muted">
                        {gear.brand}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
