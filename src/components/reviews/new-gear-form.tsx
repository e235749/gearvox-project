"use client";

import { useMemo, useState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { GearStatusBadge } from "@/components/gears/gear-status-badge";
import { createPendingGear } from "@/lib/gears/actions";
import { findSimilarGears } from "@/lib/gears/find-similar-gears";
import { formatGearLabel } from "@/lib/gears/format-gear-label";
import type { GearCategoryItem, GearListItem } from "@/lib/gears/types";

interface NewGearFormProps {
  gears: GearListItem[];
  categories: GearCategoryItem[];
  initialName?: string;
  onCancel: () => void;
  onCreated: (gear: GearListItem) => void;
}

export function NewGearForm({
  gears,
  categories,
  initialName = "",
  onCancel,
  onCreated,
}: NewGearFormProps) {
  const [name, setName] = useState(initialName);
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [confirmedNew, setConfirmedNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const similarGears = useMemo(
    () => findSimilarGears(gears, name, brand),
    [gears, name, brand],
  );

  const showSimilarWarning = similarGears.length > 0 && !confirmedNew;

  async function handleSubmit() {
    setError(null);

    if (!name.trim()) {
      setError("ギア名を入力してください。");
      return;
    }

    if (showSimilarWarning) {
      setError("類似ギアを確認するか、「新規登録を続ける」を押してください。");
      return;
    }

    setIsPending(true);

    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("brand", brand);
      if (categoryId) {
        formData.set("category_id", categoryId);
      }

      const result = await createPendingGear(null, formData);

      if (!result.success || !result.gearId) {
        setError(result.error ?? "ギアの登録に失敗しました。");
        return;
      }

      const category = categories.find((item) => item.id === categoryId) ?? null;
      onCreated({
        id: result.gearId,
        name,
        brand: brand || null,
        image_url: null,
        category_id: categoryId || null,
        category_name: category?.name ?? null,
        status: "pending",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">新規ギアを登録</h3>
        <p className="text-xs text-muted">
          レビュー投稿のため、未登録のギアを追加します。正式名称は管理者が後から確認します。
        </p>
      </div>

      {error ? <AuthAlert message={error} /> : null}

      <div className="space-y-2">
        <label htmlFor="new-gear-name" className="text-sm text-muted">
          ギア名（必須）
        </label>
        <input
          id="new-gear-name"
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setConfirmedNew(false);
          }}
          maxLength={200}
          placeholder="例: ランドロック Pro.4"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="new-gear-brand" className="text-sm text-muted">
          ブランド名（任意）
        </label>
        <input
          id="new-gear-brand"
          type="text"
          value={brand}
          onChange={(event) => {
            setBrand(event.target.value);
            setConfirmedNew(false);
          }}
          maxLength={100}
          placeholder="例: Snow Peak"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="new-gear-category" className="text-sm text-muted">
          カテゴリ（任意）
        </label>
        <select
          id="new-gear-category"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
        >
          <option value="">選択しない</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {showSimilarWarning ? (
        <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <p className="text-sm text-amber-200">もしかして、次のギアではありませんか？</p>
          <ul className="space-y-2">
            {similarGears.map((gear) => (
              <li key={gear.id}>
                <button
                  type="button"
                  onClick={() => onCreated(gear)}
                  className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:border-accent/50"
                >
                  <span>{formatGearLabel(gear.name, gear.brand)}</span>
                  <GearStatusBadge status={gear.status} />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setConfirmedNew(true)}
            className="text-sm text-accent hover:underline"
          >
            新規登録を続ける
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !name.trim()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "登録中..." : "ギアを登録して選択"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
