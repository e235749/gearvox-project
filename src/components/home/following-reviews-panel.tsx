import Link from "next/link";

export function FollowingReviewsPanel() {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-4 text-sm">
      <p className="text-muted">
        フォロー中のユーザーのレビューがここに表示されます。
      </p>
      <p className="text-xs text-muted">
        フォロー機能は次のステップで実装予定です。まずは「新着」タブでみんなのレビューをチェックしてみましょう。
      </p>
      <Link href="/?tab=latest" className="text-accent hover:underline">
        新着レビューを見る
      </Link>
      <Link href="/search" className="block text-accent hover:underline">
        ギアを検索する
      </Link>
    </div>
  );
}
