"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateContextPrivacy } from "@/lib/users/context-privacy-actions";

interface ContextPrivacyToggleProps {
  initialIsPublic: boolean;
}

export function ContextPrivacyToggle({
  initialIsPublic,
}: ContextPrivacyToggleProps) {
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(nextIsPublic: boolean) {
    if (isPending || nextIsPublic === isPublic) {
      return;
    }

    setError(null);
    const previous = isPublic;
    setIsPublic(nextIsPublic);

    startTransition(async () => {
      const result = await updateContextPrivacy(nextIsPublic);

      if (!result.success) {
        setIsPublic(previous);
        setError(result.error ?? "設定の更新に失敗しました。");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted">キャンプスタイルの公開</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleChange(true)}
          className={`rounded-full border px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            isPublic
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-surface text-foreground hover:border-accent/50"
          }`}
        >
          公開
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleChange(false)}
          className={`rounded-full border px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            !isPublic
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-surface text-foreground hover:border-accent/50"
          }`}
        >
          非公開
        </button>
      </div>
      <p className="text-xs text-muted">
        非公開にすると、他ユーザーにはキャンプスタイルの内容が表示されません。
      </p>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
