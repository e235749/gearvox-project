"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { approveGear, mergeGear, rejectGear } from "@/lib/gears/actions";
import { formatGearLabel } from "@/lib/gears/format-gear-label";
import type { GearCategoryItem, PendingGearListItem } from "@/lib/gears/types";

interface PendingGearAdminCardProps {
  gear: PendingGearListItem;
  categories: GearCategoryItem[];
  approvedGears: Array<{ id: string; name: string; brand: string | null }>;
}

export function PendingGearAdminCard({
  gear,
  categories,
  approvedGears,
}: PendingGearAdminCardProps) {
  const router = useRouter();
  const [name, setName] = useState(gear.name);
  const [brand, setBrand] = useState(gear.brand ?? "");
  const [categoryId, setCategoryId] = useState(gear.category?.id ?? "");
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleApprove() {
    setError(null);
    setMessage(null);
    setIsPending(true);

    try {
      const formData = new FormData();
      formData.set("gear_id", gear.id);
      formData.set("name", name);
      formData.set("brand", brand);
      if (categoryId) {
        formData.set("category_id", categoryId);
      }

      const result = await approveGear(null, formData);
      if (!result.success) {
        setError(result.error ?? "承認に失敗しました。");
        return;
      }

      setMessage("ギアを正式登録しました。");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  async function handleMerge() {
    setError(null);
    setMessage(null);

    if (!mergeTargetId) {
      setError("マージ先のギアを選択してください。");
      return;
    }

    setIsPending(true);

    try {
      const result = await mergeGear(gear.id, mergeTargetId);
      if (!result.success) {
        setError(result.error ?? "マージに失敗しました。");
        return;
      }

      setMessage("既存ギアへマージしました。");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  async function handleReject() {
    setError(null);
    setMessage(null);
    setIsPending(true);

    try {
      const result = await rejectGear(gear.id);
      if (!result.success) {
        setError(result.error ?? "却下に失敗しました。");
        return;
      }

      setMessage("ギアを却下しました。");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <li className="space-y-4 rounded-lg border border-border bg-surface p-4 text-sm">
      <div className="space-y-1">
        <p className="font-medium">{formatGearLabel(gear.name, gear.brand)}</p>
        <p className="text-xs text-muted">
          登録者: {gear.submitted_by?.display_name ?? "—"} ・ レビュー{" "}
          {gear.review_count} 件
        </p>
        {gear.submitted_name !== gear.name ? (
          <p className="text-xs text-muted">
            ユーザー入力名: {gear.submitted_name}
          </p>
        ) : null}
      </div>

      {error ? <AuthAlert message={error} /> : null}
      {message ? (
        <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
          {message}
        </p>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-muted">正式ギア名</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div className="space-y-2">
          <label className="text-muted">ブランド名</label>
          <input
            type="text"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-muted">カテゴリ</label>
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
        >
          <option value="">未設定</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          正式登録
        </button>
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <p className="text-muted">既存ギアへマージ</p>
        <select
          value={mergeTargetId}
          onChange={(event) => setMergeTargetId(event.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-accent"
        >
          <option value="">マージ先を選択</option>
          {approvedGears
            .filter((approvedGear) => approvedGear.id !== gear.id)
            .map((approvedGear) => (
              <option key={approvedGear.id} value={approvedGear.id}>
                {formatGearLabel(approvedGear.name, approvedGear.brand)}
              </option>
            ))}
        </select>
        <button
          type="button"
          onClick={handleMerge}
          disabled={isPending}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          マージする
        </button>
      </div>

      <div className="border-t border-border pt-4">
        <button
          type="button"
          onClick={handleReject}
          disabled={isPending || gear.review_count > 0}
          className="rounded-lg border border-red-500/50 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          却下
        </button>
        {gear.review_count > 0 ? (
          <p className="mt-2 text-xs text-muted">
            レビューが紐づいているため却下できません。マージしてください。
          </p>
        ) : null}
      </div>
    </li>
  );
}
