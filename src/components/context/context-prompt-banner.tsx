import Link from "next/link";

interface ContextPromptBannerProps {
  show: boolean;
}

export function ContextPromptBanner({ show }: ContextPromptBannerProps) {
  if (!show) {
    return null;
  }

  return (
    <div className="rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm">
      <p className="font-medium">キャンプスタイルのアンケートにご協力ください</p>
      <p className="mt-1 text-muted">
        約2分で完了します。あなたに合ったレビュー検索の精度向上に役立ちます。
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Link
          href="/profile/context?welcome=1"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          アンケートに答える
        </Link>
        <Link
          href="/profile/context"
          className="text-sm text-accent hover:underline"
        >
          詳細を見る
        </Link>
      </div>
    </div>
  );
}
