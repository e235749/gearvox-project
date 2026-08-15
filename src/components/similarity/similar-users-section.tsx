import Link from "next/link";

import { SimilarityBadge } from "@/components/similarity/similarity-badge";
import type { SimilarUserListItem } from "@/lib/similarity/types";

interface SimilarUsersSectionProps {
  similarUsers: SimilarUserListItem[];
  isContextCompleted: boolean;
}

export function SimilarUsersSection({
  similarUsers,
  isContextCompleted,
}: SimilarUsersSectionProps) {
  if (!isContextCompleted) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">似ているキャンパー</h2>
        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
          <p>キャンプスタイルのアンケートに回答すると、似ているキャンパーを表示できます。</p>
          <Link
            href="/profile/context?welcome=1"
            className="mt-2 inline-block text-accent hover:underline"
          >
            キャンプスタイルを設定する
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">似ているキャンパー</h2>
        <p className="text-xs text-muted">
          類似度70%以上のキャンパーを表示しています（毎晩更新）。
        </p>
      </div>

      {similarUsers.length > 0 ? (
        <ul className="space-y-3">
          {similarUsers.map((item) => (
            <li key={item.userId}>
              <Link
                href={`/users/${item.userId}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {item.avatarUrl ? (
                    <img
                      src={item.avatarUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-xs text-muted">
                      —
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.displayName}</p>
                    <p className="text-xs text-muted">類似度 {item.percent}%</p>
                  </div>
                </div>
                <SimilarityBadge similarity={item} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
          まだ類似度70%以上のキャンパーは見つかりません。夜間の更新後に再度ご確認ください。
        </div>
      )}
    </section>
  );
}
